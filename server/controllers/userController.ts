import Blog from '../models/Blog.js'
import Comment from '../models/Comment.js'
import { Types } from 'mongoose'
import { handle, HttpError } from '../utils/http.js'
import { pageInfo, pagination } from '../utils/validation.js'

export const getUserLikedBlogs = handle(async (req, res) => {
    const userId = req.user?.id
    if (!userId) throw new HttpError(403, 'Use a registered reader account to view your reading list.')
    const {page, limit, skip} = pagination(req.query, 100)
    // Find published blogs where the likes array contains the userId.
    const filter = {likes: userId, isPublished: true}
    const [blogs, total] = await Promise.all([
        Blog.find(filter).sort({createdAt: -1, _id: -1}).skip(skip).limit(limit), Blog.countDocuments(filter),
    ])
    res.json({success: true, blogs, pagination: pageInfo(total, page, limit)})
})

export const getUserComments = handle(async (req, res) => {
    const userId = req.user?.id
    if (!userId) throw new HttpError(403, 'Use a registered reader account to view your comments.')
    const {page, limit, skip} = pagination(req.query, 100)
    // Join before pagination so deleted/unpublished articles cannot leak through a member profile.
    const [result] = await Comment.aggregate<{comments: unknown[], metadata: {total: number}[]}>([
        {$match: {user: new Types.ObjectId(userId)}},
        {$lookup: {
            from: Blog.collection.name, localField: 'blog', foreignField: '_id', as: 'blog',
            pipeline: [{$match: {isPublished: true}}, {$project: {title: 1, image: 1, category: 1, isPublished: 1}}],
        }},
        {$unwind: '$blog'},
        {$facet: {comments: [{$sort: {createdAt: -1, _id: -1}}, {$skip: skip}, {$limit: limit}], metadata: [{$count: 'total'}]}},
    ])
    const comments = result?.comments || []
    const total = result?.metadata[0]?.total || 0
    res.json({success: true, comments, pagination: pageInfo(total, page, limit)})
})
