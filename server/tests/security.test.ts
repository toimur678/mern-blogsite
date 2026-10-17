import assert from 'node:assert/strict'
import test from 'node:test'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import type { NextFunction, Request, Response } from 'express'
import auth, { resolveUser } from '../middleware/auth.js'
import requireRole from '../middleware/rbac.js'
import { rateLimit, trustedOrigin } from '../middleware/security.js'
import User from '../models/User.js'
import { environmentUser, setSession } from '../utils/session.js'

const secret = 'a-test-secret-that-is-only-used-in-offline-tests'
const id = '507f1f77bcf86cd799439011'

const response = () => {
    const result = {statusCode: 200, body: {} as Record<string, unknown>, headers: {} as Record<string, unknown>}
    const res = {
        status(code: number) { result.statusCode = code; return this },
        json(body: Record<string, unknown>) { result.body = body; return this },
        setHeader(name: string, value: unknown) { result.headers[name] = value; return this },
    } as unknown as Response
    return {res, result}
}

test('missing and invalid cookies produce HTTP 401', async () => {
    process.env.JWT_SECRET = secret
    for (const token of [undefined, 'invalid']) {
        const {res, result} = response()
        let nextCalled = false
        await auth({cookies: {token}} as unknown as Request, res, () => { nextCalled = true })
        assert.equal(result.statusCode, 401)
        assert.equal(result.body.success, false)
        assert.equal(nextCalled, false)
    }
})

test('JWTs without expiry, expired JWTs, and algorithm confusion are rejected', async () => {
    process.env.JWT_SECRET = secret
    const payload = {id, email: 'reader@example.com', role: 'user'}
    assert.equal(await resolveUser(jwt.sign(payload, secret)), null)
    assert.equal(await resolveUser(jwt.sign(payload, secret, {expiresIn: -1})), null)
    assert.equal(await resolveUser(jwt.sign(payload, secret, {algorithm: 'HS384', expiresIn: '1h'})), null)
})

test('current database role overrides JWT role and suspended users lose access', async () => {
    process.env.JWT_SECRET = secret
    const original = User.findById
    let suspended = false
    User.findById = (() => ({select: async () => ({_id: new Types.ObjectId(id), name: 'Reader', email: 'reader@example.com', role: 'user', isActive: !suspended})})) as unknown as typeof User.findById
    try {
        const token = jwt.sign({id, email: 'reader@example.com', role: 'admin'}, secret, {expiresIn: '1h'})
        assert.equal((await resolveUser(token))?.role, 'user')
        suspended = true
        assert.equal(await resolveUser(token), null)
    } finally { User.findById = original }
})

test('role middleware blocks readers from staff actions', () => {
    const {res, result} = response()
    let nextCalled = false
    requireRole('admin', 'editor')({user: {role: 'user'}} as Request, res, () => { nextCalled = true })
    assert.equal(result.statusCode, 403)
    assert.equal(nextCalled, false)
})

test('state-changing requests require a trusted browser origin', () => {
    const previous = process.env.CLIENT_URL
    process.env.CLIENT_URL = 'https://journal.example.com'
    try {
        const {res, result} = response()
        trustedOrigin({method: 'POST', get: () => 'https://attacker.example.com'} as unknown as Request, res, () => assert.fail('Untrusted origin was accepted'))
        assert.equal(result.statusCode, 403)
        let nextCalled = false
        trustedOrigin({method: 'POST', get: () => 'https://journal.example.com'} as unknown as Request, res, () => { nextCalled = true })
        assert.equal(nextCalled, true)
    } finally {
        if (previous === undefined) delete process.env.CLIENT_URL
        else process.env.CLIENT_URL = previous
    }
})

test('cross-site browser writes without Origin are blocked while non-browser API requests work', () => {
    const {res, result} = response()
    trustedOrigin({method: 'POST', get: (header: string) => header === 'sec-fetch-site' ? 'cross-site' : undefined} as unknown as Request, res, () => assert.fail('Cross-site write was accepted'))
    assert.equal(result.statusCode, 403)
    let accepted = false
    trustedOrigin({method: 'POST', get: () => undefined} as unknown as Request, res, () => { accepted = true })
    assert.equal(accepted, true)
})

test('rate limit rejects excess attempts and supplies Retry-After', () => {
    const limiter = rateLimit(2, 10000)
    const {res, result} = response()
    let accepted = 0
    const next: NextFunction = () => { accepted += 1 }
    const req = {ip: '127.0.0.1'} as Request
    limiter(req, res, next)
    limiter(req, res, next)
    limiter(req, res, next)
    assert.equal(accepted, 2)
    assert.equal(result.statusCode, 429)
    assert.equal(result.headers['Retry-After'], 10)
})

test('session cookie is HTTP-only and JWT has a seven-day expiry', () => {
    process.env.JWT_SECRET = secret
    let token = ''
    let options: Record<string, unknown> = {}
    const res = {cookie: (_name: string, value: string, cookieOptions: Record<string, unknown>) => { token = value; options = cookieOptions }} as unknown as Response
    setSession(res, {id, email: 'reader@example.com', role: 'user'})
    const payload = jwt.verify(token, secret) as jwt.JwtPayload
    assert.equal(payload.exp! - payload.iat!, 7 * 24 * 60 * 60)
    assert.equal(options.httpOnly, true)
    assert.equal(options.path, '/')
})

test('missing environment credentials cannot authenticate an empty staff login', () => {
    assert.equal(environmentUser('', ''), null)
})
