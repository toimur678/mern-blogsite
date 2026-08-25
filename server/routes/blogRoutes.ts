import express from 'express'
import { addBlog, addComment, deleteBlogById, getAllBlogs, getBlogById, getBlogComments, togglePublish } from '../controllers/blogController.js'
import upload from '../middleware/multer.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/rbac.js'

const blogRouter = express.Router()

// Admin + Editor
blogRouter.post("/add", upload.single('image'), auth, requireRole('admin', 'editor'), addBlog)
blogRouter.post("/toggle-publish", auth, requireRole('admin', 'editor'), togglePublish)

// Admin only
blogRouter.post("/delete", auth, requireRole('admin'), deleteBlogById)

// Public
blogRouter.get("/all", getAllBlogs)
blogRouter.get("/:blogId", getBlogById)
blogRouter.post("/add-comment", addComment)
blogRouter.post("/comments", getBlogComments)

export default blogRouter
