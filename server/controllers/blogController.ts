import { Request, Response } from 'express'
import fs from 'fs'
import imagekit from '../configs/imageKit.js'
import Blog from '../models/Blog.js'
import Comment from '../models/Comment.js'
import { EditorOutputData, EditorBlock } from '../models/Blog.js'

// Allowed Editor.js block types — reject any unknown types to prevent injection
const ALLOWED_BLOCK_TYPES = new Set([
    'paragraph', 'header', 'list', 'quote', 'delimiter', 'inlineCode'
])

/**
 * Sanitizes Editor.js output data:
 * - Strips unknown block types
 * - Removes HTML tags from text fields to prevent stored XSS
 */
function sanitizeEditorData(data: EditorOutputData): EditorOutputData {
    const sanitizedBlocks: EditorBlock[] = data.blocks
        .filter(block => ALLOWED_BLOCK_TYPES.has(block.type))
        .map(block => {
            const sanitized = { ...block, data: { ...block.data } }

            // Strip HTML tags from text fields
            if (typeof sanitized.data.text === 'string') {
                sanitized.data.text = stripHtmlTags(sanitized.data.text)
            }

            // Sanitize list items
            if (Array.isArray(sanitized.data.items)) {
                sanitized.data.items = (sanitized.data.items as string[]).map(item =>
                    typeof item === 'string' ? stripHtmlTags(item) : item
                )
            }

            return sanitized
        })

    return {
        time: data.time,
        blocks: sanitizedBlocks,
        version: data.version,
    }
}

function stripHtmlTags(str: string): string {
    return str.replace(/<[^>]*>/g, '')
}

export const addBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog)

        const imageFile = req.file

        // Check if all fields are present
        if(!title || !description || !category || !imageFile) {
            res.json({success: false, message: "Missing required fields"})
            return
        }

        // Validate and sanitize Editor.js JSON
        if (!description.blocks || !Array.isArray(description.blocks)) {
            res.json({success: false, message: "Invalid description format"})
            return
        }

        const sanitizedDescription = sanitizeEditorData(description as EditorOutputData)

        const fileBuffer = fs.readFileSync(imageFile.path)

        // Upload Image to ImageKit
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        })

        // Optimization through ImageKit URL Transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'}, // Auto compression
                {format: 'webp'}, // Convert to modern format
                {width: '1280'} // Width resizing
            ]
        })
        
        const image = optimizedImageUrl

        await Blog.create({title, subTitle, description: sanitizedDescription, category, image, isPublished})

        res.json({success: true, message: "Blog added successfully"})

    } catch(error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const editBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog)
        const imageFile = req.file

        const blog = await Blog.findById(id)
        if (!blog) {
            res.json({success: false, message: "Blog not found"})
            return
        }

        const sanitizedDescription = sanitizeEditorData(description as EditorOutputData)

        let image = blog.image
        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: "/blogs"
            })
            image = imagekit.url({
                path: response.filePath,
                transformation: [{quality: 'auto'}, {format: 'webp'}, {width: '1280'}]
            })
        }

        blog.title = title
        blog.subTitle = subTitle
        blog.description = sanitizedDescription
        blog.category = category
        blog.isPublished = isPublished
        blog.image = image

        await blog.save()
        res.json({success: true, message: "Blog updated successfully"})
    } catch(error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const getAllBlogs = async (_req: Request, res: Response): Promise<void> => {
    try {
        const blogs = await Blog.find({isPublished: true})
        res.json({success: true, blogs})
    } catch(error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { blogId } = req.params
        const blog = await Blog.findById(blogId)
        if(!blog) {
            res.json({success: false, message: "Blog not found"})
            return
        }
        res.json({success: true, blog})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const deleteBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body
        await Blog.findByIdAndDelete(id)

        // Delete all comments associated with this blog
        await Comment.deleteMany({blog: id})

        res.json({success: true, message: "Blog deleted successfully"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const togglePublish = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body
        const blog = await Blog.findById(id)
        if (!blog) {
            res.json({success: false, message: "Blog not found"})
            return
        }
        blog.isPublished = !blog.isPublished
        await blog.save()
        res.json({success: true, message: "Blog status updated"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { blog, content } = req.body
        const userId = req.user?.id
        
        if (!userId) {
            res.json({success: false, message: "Must be logged in to comment"})
            return
        }
        
        const name = req.user?.name || "User"
        await Comment.create({blog, user: userId, name, content, isApproved: false}) // requires admin approval
        res.json({success: true, message: "Comment submitted for approval"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const getBlogComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { blogId } = req.body
        const token = req.cookies?.token

        let userId = null
        if (token) {
            try {
                // Ignore typescript warnings here for importing jwt by using require
                const jwt = require('jsonwebtoken')
                const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
                userId = decoded.id
            } catch (err) {}
        }

        const query: any = { blog: blogId }
        if (userId) {
            query.$or = [{ isApproved: true }, { user: userId }]
        } else {
            query.isApproved = true
        }

        const comments = await Comment.find(query).populate('user', 'name').sort({createdAt: -1})
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const editComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { commentId, content } = req.body
        const userId = req.user?.id

        if (!userId) {
            res.json({success: false, message: "Not authorized"})
            return
        }

        const comment = await Comment.findById(commentId)
        if (!comment) {
            res.json({success: false, message: "Comment not found"})
            return
        }

        if (comment.user?.toString() !== userId) {
            res.json({success: false, message: "Not authorized to edit this comment"})
            return
        }

        comment.content = content
        await comment.save()
        res.json({success: true, message: "Comment updated"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const deleteUserComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { commentId } = req.body
        const userId = req.user?.id

        if (!userId) {
            res.json({success: false, message: "Not authorized"})
            return
        }

        const comment = await Comment.findById(commentId)
        if (!comment) {
            res.json({success: false, message: "Comment not found"})
            return
        }

        if (comment.user?.toString() !== userId) {
            res.json({success: false, message: "Not authorized to delete this comment"})
            return
        }

        await comment.deleteOne()
        res.json({success: true, message: "Comment deleted"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const likeBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body
        const userId = req.user?.id
        
        if (!userId) {
            res.json({success: false, message: "Must be logged in to like"})
            return
        }

        const blog = await Blog.findById(id)
        if (!blog) {
            res.json({success: false, message: "Blog not found"})
            return
        }

        if (blog.likes.includes(userId)) {
            res.json({success: false, message: "Already liked"})
            return
        }

        blog.likes.push(userId)
        await blog.save()
        res.json({success: true, message: "Blog liked"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const unlikeBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body
        const userId = req.user?.id

        if (!userId) {
            res.json({success: false, message: "Must be logged in to unlike"})
            return
        }

        const blog = await Blog.findById(id)
        if (!blog) {
            res.json({success: false, message: "Blog not found"})
            return
        }

        const index = blog.likes.indexOf(userId)
        if (index > -1) {
            blog.likes.splice(index, 1)
            await blog.save()
        }

        res.json({success: true, message: "Blog unliked"})
    } catch (error) {
        res.json({success: false, message: (error as Error).message})
    }
}

export const generateAiContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, subTitle } = req.body
        const aiUrl = process.env.AI_MICROSERVICE_URL

        if (!aiUrl) {
            res.json({ success: false, message: "AI Microservice URL is not configured." })
            return
        }

        const response = await fetch(aiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, subTitle }),
        })

        if (!response.ok) {
            throw new Error(`AI Service responded with status: ${response.status}`)
        }

        const data = await response.json()
        
        // Ensure we pass back 'blocks' (the structure Editor.js needs)
        // If the AI microservice returns something else, we adapt it here.
        if (data.blocks) {
            res.json({ success: true, blocks: data.blocks })
        } else {
            res.json({ success: false, message: "Invalid format returned from AI service" })
        }

    } catch (error) {
        res.json({ success: false, message: (error as Error).message })
    }
}
