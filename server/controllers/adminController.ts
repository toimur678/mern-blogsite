import type { Request, Response } from 'express'
import type { FilterQuery } from 'mongoose'
import Blog, { type IBlog } from '../models/Blog.js'
import Comment from '../models/Comment.js'
import User, { type IUser } from '../models/User.js'
import Subscriber from '../models/Subscriber.js'
import { handle, HttpError } from '../utils/http.js'
import { booleanValue, emailAddress, escapeRegex, objectId, pageInfo, pagination, passwordValue, record, text } from '../utils/validation.js'
import { setSession } from '../utils/session.js'
import { authenticate, checkAuth as checkSession, logout } from './authController.js'

export const adminLogin = handle(async (req, res) => {
    const body = record(req.body)
    const user = await authenticate(emailAddress(body.email), passwordValue(body.password))
    if (!['admin', 'editor'].includes(user.role)) throw new HttpError(403, 'This account does not have access to the studio.')
    setSession(res, user)
    res.json({success: true, role: user.role, user})
})

export const adminLogout = logout
export const checkAuth = checkSession

export const blogFilter = (query: Request['query'], publicOnly = false): FilterQuery<IBlog> => {
    const filter: FilterQuery<IBlog> = publicOnly ? {isPublished: true} : {}
    if (query.search !== undefined) {
        const search = escapeRegex(text(query.search, 'Search', 1, 120))
        filter.$or = [{title: {$regex: search, $options: 'i'}}, {subTitle: {$regex: search, $options: 'i'}}, {tags: {$regex: search, $options: 'i'}}]
    }
    if (query.category !== undefined && query.category !== 'All') filter.category = text(query.category, 'Category', 1, 50)
    if (!publicOnly && query.status !== undefined) {
        if (!['published', 'draft', 'all'].includes(String(query.status))) throw new HttpError(400, 'Invalid article status.')
        if (query.status !== 'all') filter.isPublished = query.status === 'published'
    }
    if (query.featured !== undefined) {
        if (query.featured !== 'true' && query.featured !== 'false') throw new HttpError(400, 'Invalid featured filter.')
        filter.featured = query.featured === 'true'
    }
    return filter
}

export const getAllBlogsAdmin = handle(async (req, res) => {
    const {page, limit, skip} = pagination(req.query, 100)
    const filter = blogFilter(req.query)
    const [blogs, total] = await Promise.all([
        Blog.find(filter).sort({createdAt: -1, _id: -1}).skip(skip).limit(limit), Blog.countDocuments(filter),
    ])
    res.json({success: true, blogs, pagination: pageInfo(total, page, limit)})
})

export const getBlogAdmin = handle(async (req, res) => {
    const blog = await Blog.findById(objectId(req.params.id, 'article ID'))
    if (!blog) throw new HttpError(404, 'Article not found.')
    res.json({success: true, blog})
})

export const getAllComments = handle(async (req, res) => {
    const {page, limit, skip} = pagination(req.query, 100)
    const filter: Record<string, unknown> = {}
    if (req.query.status !== undefined && req.query.status !== 'all') {
        if (!['pending', 'approved'].includes(String(req.query.status))) throw new HttpError(400, 'Invalid comment status.')
        filter.isApproved = req.query.status === 'approved'
    }
    if (req.query.search !== undefined) {
        const search = escapeRegex(text(req.query.search, 'Search', 1, 120))
        filter.$or = [{name: {$regex: search, $options: 'i'}}, {content: {$regex: search, $options: 'i'}}]
    }
    const [comments, total] = await Promise.all([
        Comment.find(filter).populate('blog', 'title image category isPublished').sort({createdAt: -1, _id: -1}).skip(skip).limit(limit),
        Comment.countDocuments(filter),
    ])
    res.json({success: true, comments, pagination: pageInfo(total, page, limit)})
})

export const getDashboard = handle(async (_req, res) => {
    const [recentBlogs, blogs, comments, drafts, pendingComments, users, subscribers, engagement] = await Promise.all([
        Blog.find({}).sort({createdAt: -1}).limit(5), Blog.countDocuments(), Comment.countDocuments(),
        Blog.countDocuments({isPublished: false}), Comment.countDocuments({isApproved: false}),
        User.countDocuments(), Subscriber.countDocuments({isActive: true}),
        Blog.aggregate< {totalLikes: number} >([{$group: {_id: null, totalLikes: {$sum: {$size: {$ifNull: ['$likes', []]}}}}}]),
    ])
    const dashboardData = {
        blogs, comments, drafts, recentBlogs, published: blogs - drafts, pendingComments, users, subscribers,
        totalLikes: engagement[0]?.totalLikes || 0,
    }
    res.json({success: true, dashboardData})
})

export const deleteCommentById = handle(async (req, res) => {
    const id = objectId(record(req.body).id, 'comment ID')
    if (!await Comment.findByIdAndDelete(id)) throw new HttpError(404, 'Comment not found.')
    res.json({success: true, message: 'Comment deleted successfully'})
})

export const approveCommentById = handle(async (req, res) => {
    const body = record(req.body)
    const id = objectId(body.id, 'comment ID')
    const isApproved = booleanValue(body.isApproved, true)
    const comment = await Comment.findByIdAndUpdate(id, {isApproved}, {new: true, runValidators: true})
    if (!comment) throw new HttpError(404, 'Comment not found.')
    res.json({success: true, comment, message: isApproved ? 'Comment approved successfully' : 'Comment returned to moderation'})
})

export const getAllUsers = handle(async (req, res) => {
    const {page, limit, skip} = pagination(req.query, 100)
    const filter: FilterQuery<IUser> = {}
    if (req.query.role !== undefined && req.query.role !== 'all') {
        if (typeof req.query.role !== 'string' || !['user', 'editor', 'admin'].includes(req.query.role)) throw new HttpError(400, 'Invalid member role.')
        filter.role = req.query.role
    }
    if (req.query.search !== undefined) {
        const search = escapeRegex(text(req.query.search, 'Search', 1, 120))
        filter.$or = [{name: {$regex: search, $options: 'i'}}, {email: {$regex: search, $options: 'i'}}]
    }
    const [users, total] = await Promise.all([
        User.find(filter).select('-password').sort({createdAt: -1, _id: -1}).skip(skip).limit(limit).lean(), User.countDocuments(filter),
    ])
    // Fetch comments for the whole page in one query instead of making one database request per member.
    const comments = await Comment.find({user: {$in: users.map(user => user._id)}}).sort({createdAt: -1}).lean()
    const byUser = new Map<string, typeof comments>()
    for (const comment of comments) {
        const key = comment.user?.toString()
        if (key) byUser.set(key, [...(byUser.get(key) || []), comment])
    }
    const usersWithComments = users.map(user => ({...user, isActive: user.isActive !== false, comments: byUser.get(user._id.toString()) || []}))
    res.json({success: true, users: usersWithComments, pagination: pageInfo(total, page, limit)})
})

export const updateUser = handle(async (req, res) => {
    const id = objectId(req.params.id, 'user ID')
    const body = record(req.body)
    const updates: {role?: 'user' | 'editor' | 'admin', isActive?: boolean} = {}
    if (body.role !== undefined) {
        if (typeof body.role !== 'string' || !['user', 'editor', 'admin'].includes(body.role)) throw new HttpError(400, 'Choose a valid account role.')
        updates.role = body.role as typeof updates.role
    }
    if (body.isActive !== undefined) updates.isActive = booleanValue(body.isActive)
    if (!Object.keys(updates).length) throw new HttpError(400, 'Choose a role or account status to update.')
    if (req.user?.id === id && (updates.isActive === false || (updates.role !== undefined && updates.role !== 'admin'))) {
        throw new HttpError(400, 'You cannot suspend or remove your own administrator access.')
    }
    const user = await User.findByIdAndUpdate(id, updates, {new: true, runValidators: true}).select('-password')
    if (!user) throw new HttpError(404, 'User not found.')
    res.json({success: true, user, message: 'Member updated successfully'})
})

export const getSubscribers = handle(async (req, res) => {
    const {page, limit, skip} = pagination(req.query, 100)
    const [subscribers, total] = await Promise.all([
        Subscriber.find({isActive: true}).sort({createdAt: -1, _id: -1}).skip(skip).limit(limit), Subscriber.countDocuments({isActive: true}),
    ])
    res.json({success: true, subscribers, pagination: pageInfo(total, page, limit)})
})

export const updateSubscriber = handle(async (req, res) => {
    const id = objectId(req.params.id, 'subscriber ID')
    const body = record(req.body)
    if (typeof body.isActive !== 'boolean') throw new HttpError(400, 'Subscriber status must be true or false.')
    const subscriber = await Subscriber.findByIdAndUpdate(id, {isActive: body.isActive}, {new: true, runValidators: true})
    if (!subscriber) throw new HttpError(404, 'Subscriber not found.')
    res.json({success: true, subscriber, message: body.isActive ? 'Subscriber restored' : 'Subscriber removed from the active list'})
})
