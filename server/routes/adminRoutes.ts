import express from 'express'
import { adminLogin, adminLogout, approveCommentById, checkAuth, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard } from '../controllers/adminController.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/rbac.js'

const adminRouter = express.Router()

// Public
adminRouter.post("/login", adminLogin)
adminRouter.post("/logout", adminLogout)

// Any authenticated user
adminRouter.get("/check-auth", auth, checkAuth)

// Admin + Editor
adminRouter.get("/dashboard", auth, requireRole('admin', 'editor'), getDashboard)
adminRouter.get("/blogs", auth, requireRole('admin', 'editor'), getAllBlogsAdmin)
adminRouter.get("/comments", auth, requireRole('admin', 'editor'), getAllComments)

// Admin only
adminRouter.post("/delete-comment", auth, requireRole('admin'), deleteCommentById)
adminRouter.post("/approve-comment", auth, requireRole('admin'), approveCommentById)

export default adminRouter
