import { randomUUID } from 'node:crypto'
import getImageKit from '../configs/imageKit.js'
import Blog, { type EditorOutputData, type IBlog } from '../models/Blog.js'
import Comment from '../models/Comment.js'
import type { Request } from 'express'
import { handle, HttpError } from '../utils/http.js'
import { articleText, booleanValue, imageUrl, objectId, pageInfo, pagination, record, sanitizeEditorData, text } from '../utils/validation.js'
import { blogFilter } from './adminController.js'

const slugFor = (title: string): string => `${title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'article'}-${randomUUID().slice(0, 8)}`

const articleBody = (req: Request, previous?: IBlog) => {
    let body: Record<string, unknown>
    if (typeof req.body?.blog === 'string') {
        try { body = record(JSON.parse(req.body.blog)) } catch { throw new HttpError(400, 'Article data must contain valid JSON.') }
    } else {
        body = record(req.body?.blog ?? req.body)
    }
    const title = text(body.title, 'Title', 3, 180)
    const subTitle = body.subTitle === undefined ? '' : text(body.subTitle, 'Subtitle', 0, 320)
    const category = text(body.category, 'Category', 1, 50)
    const description = sanitizeEditorData(body.description)
    const content = articleText(description).trim()
    const isPublished = booleanValue(body.isPublished, previous?.isPublished ?? false)
    if (isPublished && !content) throw new HttpError(400, 'Add article content before publishing.')
    const authorName = body.authorName === undefined ? previous?.authorName || req.user?.name || 'The Editorial Team' : text(body.authorName, 'Author name', 2, 80)
    const featured = booleanValue(body.featured, previous?.featured ?? false)
    const sourceTags = body.tags ?? previous?.tags ?? []
    if (!Array.isArray(sourceTags) || sourceTags.length > 8) throw new HttpError(400, 'Choose at most 8 tags.')
    const tags = [...new Set(sourceTags.map(tag => text(tag, 'Tag', 1, 30)))]
    const excerpt = body.excerpt === undefined ? (subTitle || content).slice(0, 320) : text(body.excerpt, 'Excerpt', 0, 320)
    const readTime = Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 220))
    return {
        title, subTitle, category, description, isPublished, authorName, featured, tags, excerpt, readTime,
        slug: previous?.slug || slugFor(title),
        publishedAt: previous?.publishedAt || (isPublished ? new Date() : undefined),
        image: body.image === undefined ? previous?.image : imageUrl(body.image),
    }
}

export const hasValidImageSignature = (file: Pick<Express.Multer.File, 'buffer' | 'mimetype'>): boolean => {
    const bytes = file.buffer
    if (file.mimetype === 'image/jpeg') return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    if (file.mimetype === 'image/gif') return ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))
    if (file.mimetype === 'image/webp') return bytes.length > 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    return false
}

const uploadCover = async (file: Express.Multer.File): Promise<string> => {
    if (!hasValidImageSignature(file)) throw new HttpError(400, 'The uploaded file is not a valid image.')
    const imagekit = getImageKit()
    // Upload Image to ImageKit.
    const response = await imagekit.upload({file: file.buffer, fileName: `cover-${randomUUID()}`, folder: '/blogs'})
    // Optimization through ImageKit URL Transformation.
    return imagekit.url({path: response.filePath, transformation: [{quality: 'auto'}, {format: 'webp'}, {width: '1600'}]})
}

export const addBlog = handle(async (req, res) => {
    const data = articleBody(req)
    const image = req.file ? await uploadCover(req.file) : data.image
    if (!image) throw new HttpError(400, 'Add a cover image or an HTTPS cover image URL.')
    const blog = await Blog.create({...data, image})
    res.status(201).json({success: true, blog, message: data.isPublished ? 'Article published successfully' : 'Draft saved successfully'})
})

export const editBlog = handle(async (req, res) => {
    const blog = await Blog.findById(objectId(req.params.id, 'article ID'))
    if (!blog) throw new HttpError(404, 'Article not found.')
    const data = articleBody(req, blog)
    const image = req.file ? await uploadCover(req.file) : data.image
    Object.assign(blog, {...data, image})
    await blog.save()
    res.json({success: true, blog, message: 'Article updated successfully'})
})

export const getAllBlogs = handle(async (req, res) => {
    const {page, limit, skip} = pagination(req.query, 100)
    const filter = blogFilter(req.query, true)
    if (req.query.sort !== undefined && (typeof req.query.sort !== 'string' || !['latest', 'oldest', 'popular'].includes(req.query.sort))) throw new HttpError(400, 'Choose latest, oldest, or popular sorting.')
    const direction = req.query.sort === 'oldest' ? 1 : -1
    const articles = req.query.sort === 'popular'
        ? Blog.aggregate([
            {$match: filter},
            {$addFields: {_likesCount: {$size: {$ifNull: ['$likes', []]}}}},
            {$sort: {_likesCount: -1, createdAt: -1, _id: -1}},
            {$skip: skip},
            {$limit: limit},
            {$project: {_likesCount: 0}},
        ]).then(rows => rows.map(row => Blog.hydrate(row)))
        : Blog.find(filter).sort({createdAt: direction, _id: direction}).skip(skip).limit(limit)
    const [blogs, total] = await Promise.all([
        articles, Blog.countDocuments(filter),
    ])
    res.json({success: true, blogs, pagination: pageInfo(total, page, limit)})
})

export const getBlogById = handle(async (req, res) => {
    const identifier = text(req.params.blogId, 'Article ID', 1, 220)
    const query = /^[a-f\d]{24}$/i.test(identifier) ? {_id: identifier} : {slug: identifier}
    const blog = await Blog.findOne({...query, isPublished: true})
    if (!blog) throw new HttpError(404, 'Article not found or not published.')
    res.json({success: true, blog})
})

export const deleteBlogById = handle(async (req, res) => {
    const id = objectId(record(req.body).id, 'article ID')
    if (!await Blog.findByIdAndDelete(id)) throw new HttpError(404, 'Article not found.')
    // Delete all comments associated with this blog.
    await Comment.deleteMany({blog: id})
    res.json({success: true, message: 'Article deleted successfully'})
})

export const togglePublish = handle(async (req, res) => {
    const body = record(req.body)
    const blog = await Blog.findById(objectId(body.id, 'article ID'))
    if (!blog) throw new HttpError(404, 'Article not found.')
    const nextStatus = booleanValue(body.isPublished, !blog.isPublished)
    if (nextStatus && !articleText(sanitizeEditorData(blog.description)).trim()) throw new HttpError(400, 'Add article content before publishing.')
    blog.isPublished = nextStatus
    if (nextStatus && !blog.publishedAt) blog.publishedAt = new Date()
    await blog.save()
    res.json({success: true, blog, message: nextStatus ? 'Article published' : 'Article moved to drafts'})
})

const publishedBlog = async (id: string): Promise<void> => {
    if (!await Blog.exists({_id: id, isPublished: true})) throw new HttpError(404, 'Article not found or not published.')
}

const memberId = (req: Request): string => {
    if (!req.user?.id) throw new HttpError(403, 'Use a registered reader account for this action.')
    return req.user.id
}

export const addComment = handle(async (req, res) => {
    const body = record(req.body)
    const user = memberId(req)
    const blog = objectId(body.blog, 'article ID')
    const content = text(body.content, 'Comment', 1, 2000)
    await publishedBlog(blog)
    const name = req.user?.name || 'Reader'
    // Comments require administrator or editor approval before becoming public.
    const comment = await Comment.create({blog, user, name, content, isApproved: false})
    res.status(201).json({success: true, comment, message: 'Comment submitted for approval'})
})

export const getBlogComments = handle(async (req, res) => {
    const blog = objectId(record(req.body).blogId, 'article ID')
    const {page, limit, skip} = pagination(req.query, 100)
    await publishedBlog(blog)
    const query = req.user?.id ? {blog, $or: [{isApproved: true}, {user: req.user.id}]} : {blog, isApproved: true}
    const [comments, total] = await Promise.all([
        Comment.find(query).populate('user', 'name').sort({createdAt: -1, _id: -1}).skip(skip).limit(limit), Comment.countDocuments(query),
    ])
    res.json({success: true, comments, pagination: pageInfo(total, page, limit)})
})

export const editComment = handle(async (req, res) => {
    const body = record(req.body)
    const user = memberId(req)
    const id = objectId(body.commentId, 'comment ID')
    const content = text(body.content, 'Comment', 1, 2000)
    const comment = await Comment.findOne({_id: id, user})
    if (!comment) throw new HttpError(404, 'Comment not found or does not belong to your account.')
    await publishedBlog(comment.blog.toString())
    comment.content = content
    // Editing approved content sends it through moderation again.
    comment.isApproved = false
    await comment.save()
    res.json({success: true, comment, message: 'Comment updated and submitted for approval'})
})

export const deleteUserComment = handle(async (req, res) => {
    const id = objectId(record(req.body).commentId, 'comment ID')
    const user = memberId(req)
    if (!await Comment.findOneAndDelete({_id: id, user})) throw new HttpError(404, 'Comment not found or does not belong to your account.')
    res.json({success: true, message: 'Comment deleted'})
})

export const likeBlog = handle(async (req, res) => {
    const id = objectId(record(req.body).id, 'article ID')
    const user = memberId(req)
    // Atomic set updates keep likes idempotent and avoid lost updates under concurrent requests.
    const blog = await Blog.findOneAndUpdate({_id: id, isPublished: true}, {$addToSet: {likes: user}}, {new: true})
    if (!blog) throw new HttpError(404, 'Article not found or not published.')
    res.json({success: true, likes: blog.likes, message: 'Article saved to your reading list'})
})

export const unlikeBlog = handle(async (req, res) => {
    const id = objectId(record(req.body).id, 'article ID')
    const user = memberId(req)
    const blog = await Blog.findOneAndUpdate({_id: id, isPublished: true}, {$pull: {likes: user}}, {new: true})
    if (!blog) throw new HttpError(404, 'Article not found or not published.')
    res.json({success: true, likes: blog.likes, message: 'Article removed from your reading list'})
})

export const generateAiContent = handle(async (req, res) => {
    const body = record(req.body)
    const title = text(body.title, 'Title', 3, 180)
    const subTitle = body.subTitle === undefined ? '' : text(body.subTitle, 'Subtitle', 0, 320)
    const aiUrl = process.env.AI_MICROSERVICE_URL
    if (!aiUrl) throw new HttpError(503, 'AI writing assistance is not configured. You can write your article in the editor.')
    let response: globalThis.Response
    try {
        response = await fetch(aiUrl, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({title, subTitle}), signal: AbortSignal.timeout(30000)})
    } catch { throw new HttpError(502, 'Writing assistance is temporarily unavailable. Please try again.') }
    if (!response.ok) throw new HttpError(502, 'Writing assistance is temporarily unavailable. Please try again.')
    // Ensure we pass back 'blocks' (the structure Editor.js needs).
    let description: EditorOutputData
    try { description = sanitizeEditorData(await response.json()) } catch { throw new HttpError(502, 'Writing assistance returned an unsupported article format.') }
    res.json({success: true, blocks: description.blocks})
})
