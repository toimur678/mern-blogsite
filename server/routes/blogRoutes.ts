import express from 'express'
import { addBlog, addComment, deleteBlogById, getAllBlogs, getBlogById, getBlogComments, togglePublish, generateAiContent, editComment, deleteUserComment, likeBlog, unlikeBlog, editBlog } from '../controllers/blogController.js'
import upload from '../middleware/multer.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/rbac.js'

const blogRouter = express.Router()

// Admin + Editor
blogRouter.post("/add", upload.single('image'), auth, requireRole('admin', 'editor'), addBlog)
blogRouter.put("/edit/:id", upload.single('image'), auth, requireRole('admin', 'editor'), editBlog)
blogRouter.post("/toggle-publish", auth, requireRole('admin', 'editor'), togglePublish)
blogRouter.post("/generate", auth, requireRole('admin', 'editor'), generateAiContent)

// Admin only
blogRouter.post("/delete", auth, requireRole('admin'), deleteBlogById)

// Public
blogRouter.get("/all", getAllBlogs)
blogRouter.get("/:blogId", getBlogById)
blogRouter.post("/add-comment", auth, addComment)
blogRouter.post("/comments", getBlogComments)
blogRouter.post("/edit-comment", auth, editComment)
blogRouter.post("/delete-comment", auth, deleteUserComment)
blogRouter.post("/like", auth, likeBlog)
blogRouter.post("/unlike", auth, unlikeBlog)

export default blogRouter
