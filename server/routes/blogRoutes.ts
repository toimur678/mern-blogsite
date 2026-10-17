import express from 'express'
import { addBlog, addComment, deleteBlogById, getAllBlogs, getBlogById, getBlogComments, togglePublish, generateAiContent, editComment, deleteUserComment, likeBlog, unlikeBlog, editBlog } from '../controllers/blogController.js'
import upload from '../middleware/multer.js'
import auth, { optionalAuth } from '../middleware/auth.js'
import requireRole from '../middleware/rbac.js'
import { rateLimit } from '../middleware/security.js'

const blogRouter = express.Router()

// Admin + Editor
blogRouter.post("/add", auth, requireRole('admin', 'editor'), upload.single('image'), addBlog)
blogRouter.put("/edit/:id", auth, requireRole('admin', 'editor'), upload.single('image'), editBlog)
blogRouter.post("/toggle-publish", auth, requireRole('admin', 'editor'), togglePublish)
blogRouter.post("/generate", auth, requireRole('admin', 'editor'), rateLimit(20), generateAiContent)

// Admin only
blogRouter.post("/delete", auth, requireRole('admin'), deleteBlogById)

// Public
blogRouter.get("/all", getAllBlogs)
blogRouter.get("/:blogId", getBlogById)
blogRouter.post("/add-comment", auth, rateLimit(30), addComment)
blogRouter.post("/comments", optionalAuth, getBlogComments)
blogRouter.post("/edit-comment", auth, editComment)
blogRouter.post("/delete-comment", auth, deleteUserComment)
blogRouter.post("/like", auth, likeBlog)
blogRouter.post("/unlike", auth, unlikeBlog)

export default blogRouter
