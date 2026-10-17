import assert from 'node:assert/strict'
import test from 'node:test'
import type { Request, RequestHandler, Response } from 'express'
import Blog from '../models/Blog.js'
import Comment from '../models/Comment.js'
import Subscriber from '../models/Subscriber.js'
import { addComment, editComment, getAllBlogs, getBlogById, likeBlog } from '../controllers/blogController.js'
import { updateSubscriber, updateUser } from '../controllers/adminController.js'
import { subscribe } from '../controllers/newsletterController.js'
import { HttpError } from '../utils/http.js'

const articleId = '507f1f77bcf86cd799439011'
const memberId = '507f191e810c19729de860ea'
const commentId = '507f1f77bcf86cd799439012'

const invoke = (handler: RequestHandler, request: Partial<Request>) => new Promise<{status: number, body?: Record<string, unknown>, error?: unknown}>(resolve => {
    let status = 200
    const res = {
        status(value: number) { status = value; return this },
        json(body: Record<string, unknown>) { resolve({status, body}); return this },
    } as unknown as Response
    handler({query: {}, params: {}, ...request} as Request, res, error => resolve({status, error}))
})

test('public article access always filters out drafts, including direct IDs', async () => {
    const original = Blog.findOne
    let filter: unknown
    Blog.findOne = (async (query: unknown) => { filter = query; return null }) as unknown as typeof Blog.findOne
    try {
        const result = await invoke(getBlogById, {params: {blogId: articleId}})
        assert.deepEqual(filter, {_id: articleId, isPublished: true})
        assert.ok(result.error instanceof HttpError)
        assert.equal(result.error.status, 404)
    } finally { Blog.findOne = original }
})

test('popular article browsing counts likes, keeps publication filters, and returns paginated metadata', async () => {
    const previousAggregate = Blog.aggregate
    const previousCount = Blog.countDocuments
    let pipeline: unknown
    let countFilter: unknown
    Blog.aggregate = (async (stages: unknown) => {
        pipeline = stages
        return [{_id: articleId, title: 'A popular article', likes: [memberId], isPublished: true}]
    }) as unknown as typeof Blog.aggregate
    Blog.countDocuments = (async (filter: unknown) => { countFilter = filter; return 5 }) as unknown as typeof Blog.countDocuments
    try {
        const result = await invoke(getAllBlogs, {query: {sort: 'popular', page: '2', limit: '2', category: 'Design'}})
        assert.deepEqual(countFilter, {isPublished: true, category: 'Design'})
        assert.deepEqual(pipeline, [
            {$match: {isPublished: true, category: 'Design'}},
            {$addFields: {_likesCount: {$size: {$ifNull: ['$likes', []]}}}},
            {$sort: {_likesCount: -1, createdAt: -1, _id: -1}},
            {$skip: 2}, {$limit: 2}, {$project: {_likesCount: 0}},
        ])
        assert.deepEqual(result.body?.pagination, {total: 5, page: 2, limit: 2, pages: 3})
        const blogs = result.body?.blogs as {title: string, authorName: string}[]
        assert.equal(blogs[0].title, 'A popular article')
        assert.equal(blogs[0].authorName, 'The Editorial Team')
    } finally { Blog.aggregate = previousAggregate; Blog.countDocuments = previousCount }
})

test('latest and oldest browsing retain deterministic date ordering and reject unsupported sort values', async () => {
    const previousFind = Blog.find
    const previousCount = Blog.countDocuments
    let ordering: unknown
    Blog.find = (() => ({sort: (sort: unknown) => { ordering = sort; return {skip: () => ({limit: async () => []})} }})) as unknown as typeof Blog.find
    Blog.countDocuments = (async () => 0) as unknown as typeof Blog.countDocuments
    try {
        for (const [sort, direction] of [['latest', -1], ['oldest', 1]] as const) {
            const result = await invoke(getAllBlogs, {query: {sort}})
            assert.equal(result.body?.success, true)
            assert.deepEqual(ordering, {createdAt: direction, _id: direction})
        }
        const invalid = await invoke(getAllBlogs, {query: {sort: '$where'}})
        assert.ok(invalid.error instanceof HttpError)
        assert.equal(invalid.error.status, 400)
    } finally { Blog.find = previousFind; Blog.countDocuments = previousCount }
})

test('comment creation rejects unpublished articles before storing content', async () => {
    const original = Blog.exists
    let filter: unknown
    Blog.exists = (async (query: unknown) => { filter = query; return null }) as unknown as typeof Blog.exists
    try {
        const result = await invoke(addComment, {body: {blog: articleId, content: 'A thoughtful comment.'}, user: {id: memberId, email: 'reader@example.com', name: 'Reader', role: 'user'}})
        assert.deepEqual(filter, {_id: articleId, isPublished: true})
        assert.ok(result.error instanceof HttpError)
        assert.equal(result.error.status, 404)
    } finally { Blog.exists = original }
})

test('editing a comment verifies ownership and resets moderation approval', async () => {
    const previousFind = Comment.findOne
    const previousExists = Blog.exists
    let filter: unknown
    let saved = false
    const comment = {blog: articleId, content: 'Before', isApproved: true, save: async () => { saved = true }}
    Comment.findOne = (async (query: unknown) => { filter = query; return comment }) as unknown as typeof Comment.findOne
    Blog.exists = (async () => ({_id: articleId})) as unknown as typeof Blog.exists
    try {
        const result = await invoke(editComment, {body: {commentId, content: 'Updated content'}, user: {id: memberId, email: 'reader@example.com', role: 'user'}})
        assert.deepEqual(filter, {_id: commentId, user: memberId})
        assert.equal(comment.isApproved, false)
        assert.equal(comment.content, 'Updated content')
        assert.equal(saved, true)
        assert.equal(result.body?.success, true)
    } finally { Comment.findOne = previousFind; Blog.exists = previousExists }
})

test('likes use an atomic set update restricted to published articles', async () => {
    const original = Blog.findOneAndUpdate
    let query: unknown
    let update: unknown
    Blog.findOneAndUpdate = (async (filter: unknown, changes: unknown) => { query = filter; update = changes; return {likes: [memberId]} }) as unknown as typeof Blog.findOneAndUpdate
    try {
        const result = await invoke(likeBlog, {body: {id: articleId}, user: {id: memberId, email: 'reader@example.com', role: 'user'}})
        assert.deepEqual(query, {_id: articleId, isPublished: true})
        assert.deepEqual(update, {$addToSet: {likes: memberId}})
        assert.equal(result.body?.success, true)
    } finally { Blog.findOneAndUpdate = original }
})

test('administrators cannot demote or suspend their own account', async () => {
    for (const body of [{role: 'user'}, {isActive: false}]) {
        const result = await invoke(updateUser, {params: {id: memberId}, body, user: {id: memberId, email: 'admin@example.com', role: 'admin'}})
        assert.ok(result.error instanceof HttpError)
        assert.equal(result.error.status, 400)
    }
})

test('newsletter persists normalized emails using an idempotent upsert', async () => {
    const original = Subscriber.updateOne
    let query: unknown
    let options: unknown
    Subscriber.updateOne = (async (filter: unknown, _changes: unknown, settings: unknown) => { query = filter; options = settings; return {acknowledged: true} }) as unknown as typeof Subscriber.updateOne
    try {
        const result = await invoke(subscribe, {body: {email: '  Reader@Example.COM '}})
        assert.deepEqual(query, {email: 'reader@example.com'})
        assert.deepEqual(options, {upsert: true, runValidators: true})
        assert.equal(result.body?.success, true)
    } finally { Subscriber.updateOne = original }
})

test('subscriber moderation validates IDs and deactivates without deleting subscription records', async () => {
    const original = Subscriber.findByIdAndUpdate
    let query: unknown
    let update: unknown
    Subscriber.findByIdAndUpdate = (async (id: unknown, changes: unknown) => {
        query = id
        update = changes
        return {_id: id, email: 'reader@example.com', isActive: false, createdAt: new Date('2026-01-01')}
    }) as unknown as typeof Subscriber.findByIdAndUpdate
    try {
        const invalid = await invoke(updateSubscriber, {params: {id: 'bad-id'}, body: {isActive: false}})
        assert.ok(invalid.error instanceof HttpError)
        assert.equal(invalid.error.status, 400)
        assert.equal(query, undefined)
        const result = await invoke(updateSubscriber, {params: {id: memberId}, body: {isActive: false}})
        assert.equal(query, memberId)
        assert.deepEqual(update, {isActive: false})
        assert.equal(result.body?.success, true)
        assert.equal((result.body?.subscriber as {email: string}).email, 'reader@example.com')
    } finally { Subscriber.findByIdAndUpdate = original }
})
