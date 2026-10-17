import express from 'express'
import { adminLogin, adminLogout, approveCommentById, checkAuth, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard, getAllUsers, getBlogAdmin, updateUser, getSubscribers, updateSubscriber } from '../controllers/adminController.js'
import auth from '../middleware/auth.js'
import requireRole from '../middleware/rbac.js'
import { rateLimit } from '../middleware/security.js'

const adminRouter = express.Router()

// Public
adminRouter.post("/login", rateLimit(20), adminLogin)
adminRouter.post("/logout", adminLogout)

// Any authenticated user
adminRouter.get("/check-auth", auth, checkAuth)

// Admin + Editor
adminRouter.get("/dashboard", auth, requireRole('admin', 'editor'), getDashboard)
adminRouter.get("/blogs", auth, requireRole('admin', 'editor'), getAllBlogsAdmin)
adminRouter.get("/blogs/:id", auth, requireRole('admin', 'editor'), getBlogAdmin)
adminRouter.get("/comments", auth, requireRole('admin', 'editor'), getAllComments)

// Comment moderation is available to both staff roles.
adminRouter.post("/delete-comment", auth, requireRole('admin', 'editor'), deleteCommentById)
adminRouter.post("/approve-comment", auth, requireRole('admin', 'editor'), approveCommentById)
// Admin only
adminRouter.get("/users", auth, requireRole('admin'), getAllUsers)
adminRouter.patch("/users/:id", auth, requireRole('admin'), updateUser)
adminRouter.get("/subscribers", auth, requireRole('admin'), getSubscribers)
adminRouter.patch("/subscribers/:id", auth, requireRole('admin'), updateSubscriber)

export default adminRouter
