import mongoose from 'mongoose'
import sanitizeHtml from 'sanitize-html'
import { HttpError } from './http.js'
import type { EditorBlock, EditorListEntry, EditorOutputData } from '../models/Blog.js'

export const record = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Please provide a valid request body.')
    return value as Record<string, unknown>
}

export const plainText = (value: string): string => value.replace(/<[^>]*>/g, '').trim()

export const text = (value: unknown, label: string, min = 1, max = 200): string => {
    if (typeof value !== 'string') throw new HttpError(400, `${label} is required.`)
    const result = plainText(value)
    if (result.length < min || result.length > max) throw new HttpError(400, `${label} must be ${min}–${max} characters.`)
    return result
}

export const emailAddress = (value: unknown): string => {
    if (typeof value !== 'string') throw new HttpError(400, 'Enter a valid email address.')
    const email = value.trim().toLowerCase()
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.')
    return email
}

export const passwordValue = (value: unknown, signup = false): string => {
    if (typeof value !== 'string' || value.length < (signup ? 8 : 1) || Buffer.byteLength(value, 'utf8') > 72) {
        throw new HttpError(400, signup ? 'Use a password with at least 8 characters and at most 72 bytes.' : 'Enter your password.')
    }
    return value
}

export const objectId = (value: unknown, label = 'ID'): string => {
    if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value) || !mongoose.isValidObjectId(value)) throw new HttpError(400, `Invalid ${label}.`)
    return value
}

export const booleanValue = (value: unknown, fallback = false): boolean => {
    if (value === undefined) return fallback
    if (typeof value !== 'boolean') throw new HttpError(400, 'Status must be true or false.')
    return value
}

export const pagination = (query: Record<string, unknown>, defaultLimit = 24) => {
    const integer = (value: unknown, fallback: number, maximum: number): number => {
        if (value === undefined) return fallback
        if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new HttpError(400, 'Page and limit must be positive integers.')
        const number = Number(value)
        if (!Number.isSafeInteger(number) || number < 1 || number > maximum) throw new HttpError(400, `Pagination value must be between 1 and ${maximum}.`)
        return number
    }
    const page = integer(query.page, 1, 10000)
    const limit = integer(query.limit, defaultLimit, 100)
    return { page, limit, skip: (page - 1) * limit }
}

export const pageInfo = (total: number, page: number, limit: number) => ({ total, page, limit, pages: Math.ceil(total / limit) })
export const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const imageUrl = (value: unknown): string => {
    const source = text(value, 'Cover image URL', 1, 2048)
    let url: URL
    try { url = new URL(source) } catch { throw new HttpError(400, 'Enter a valid HTTPS cover image URL.') }
    if (url.protocol !== 'https:' || url.username || url.password) throw new HttpError(400, 'Enter a valid HTTPS cover image URL.')
    return url.toString()
}

// Allowed Editor.js block types — reject any unknown types to prevent injection
const ALLOWED_BLOCK_TYPES = new Set(['paragraph', 'header', 'list', 'quote', 'delimiter', 'inlineCode'])

const inlineMarkup = (value: unknown, label: string, maximum: number): string => {
    if (typeof value !== 'string' || value.length > maximum) throw new HttpError(400, `${label} must contain at most ${maximum} characters.`)
    return sanitizeHtml(value, {
        allowedTags: ['strong', 'b', 'em', 'i', 'code', 'u', 's', 'mark', 'br', 'a'],
        allowedAttributes: {a: ['href']},
        allowedSchemes: ['http', 'https', 'mailto'],
        allowProtocolRelative: false,
        nonTextTags: ['style', 'script', 'textarea', 'option', 'iframe', 'object', 'svg', 'math'],
    }).trim()
}

const listMeta = (value: unknown): EditorListEntry['meta'] => {
    if (value === undefined) return {}
    const source = record(value)
    const meta: EditorListEntry['meta'] = {}
    if (source.checked !== undefined) meta.checked = booleanValue(source.checked)
    if (source.start !== undefined) {
        if (!Number.isInteger(source.start) || Number(source.start) < 1 || Number(source.start) > 100000) throw new HttpError(400, 'List start must be between 1 and 100000.')
        meta.start = Number(source.start)
    }
    if (source.counterType !== undefined) {
        if (typeof source.counterType !== 'string' || !['numeric', 'upper-roman', 'lower-roman', 'upper-alpha', 'lower-alpha'].includes(source.counterType)) throw new HttpError(400, 'Invalid list counter style.')
        meta.counterType = source.counterType
    }
    return meta
}

/**
 * Sanitizes Editor.js output data:
 * - Strips unknown block types
 * - Preserves safe inline formatting and removes executable HTML and attributes
 * - Keeps nested Editor.js list items with bounded depth and item counts
 */
export const sanitizeEditorData = (value: unknown): EditorOutputData => {
    const data = record(value)
    if (!Array.isArray(data.blocks) || data.blocks.length > 250) throw new HttpError(400, 'Article content must contain at most 250 blocks.')
    const blocks: EditorBlock[] = []
    let characters = 0
    let listItemCount = 0
    const sanitizeItems = (value: unknown, depth = 1): (string | EditorListEntry)[] => {
        if (!Array.isArray(value) || value.length > 100) throw new HttpError(400, 'Each list level must contain at most 100 items.')
        if (value.length && depth > 8) throw new HttpError(400, 'Lists can be nested at most 8 levels deep.')
        return value.map(item => {
            if (++listItemCount > 1000) throw new HttpError(400, 'Articles can contain at most 1000 list items.')
            const source = typeof item === 'string' ? undefined : record(item)
            const content = inlineMarkup(source ? source.content : item, 'List item', 2000)
            characters += content.length
            if (!source) return content
            return {content, items: sanitizeItems(source.items ?? [], depth + 1), meta: listMeta(source.meta)}
        })
    }
    for (const raw of data.blocks) {
        const block = record(raw)
        if (typeof block.type !== 'string' || !ALLOWED_BLOCK_TYPES.has(block.type)) throw new HttpError(400, 'Article contains an unsupported content block.')
        const source = record(block.data)
        const clean: Record<string, unknown> = {}
        if (block.type !== 'delimiter' && block.type !== 'list') {
            // Code blocks are rendered as literal text, so preserve angle brackets in code samples.
            if (block.type === 'inlineCode') {
                if (typeof source.text !== 'string' || source.text.length > 20000) throw new HttpError(400, 'Code blocks must contain at most 20000 characters.')
                clean.text = source.text
            } else clean.text = inlineMarkup(source.text, 'Block text', 20000)
            characters += (clean.text as string).length
        }
        if (block.type === 'header') {
            if (source.level !== undefined && (!Number.isInteger(source.level) || Number(source.level) < 1 || Number(source.level) > 6)) throw new HttpError(400, 'Heading level must be between 1 and 6.')
            clean.level = source.level ?? 2
        }
        if (block.type === 'quote') {
            clean.caption = source.caption === undefined ? '' : inlineMarkup(source.caption, 'Quote caption', 300)
            clean.alignment = source.alignment === 'center' ? 'center' : 'left'
        }
        if (block.type === 'list') {
            clean.items = sanitizeItems(source.items)
            if (source.style !== undefined && !['ordered', 'unordered', 'checklist'].includes(String(source.style))) throw new HttpError(400, 'Choose a valid list style.')
            clean.style = source.style ?? 'unordered'
            clean.meta = listMeta(source.meta)
        }
        if (characters > 150000) throw new HttpError(400, 'Article content is too long.')
        blocks.push({ ...(typeof block.id === 'string' ? { id: block.id.slice(0, 80) } : {}), type: block.type, data: clean })
    }
    return { blocks, ...(typeof data.version === 'string' ? { version: data.version.slice(0, 30) } : {}) }
}

export const articleText = (description: EditorOutputData): string => {
    const readable = (value: unknown, depth = 0): string => {
        if (depth > 24) return ''
        if (typeof value === 'string') return plainText(value).replace(/&nbsp;|&#160;|&#x[aA]0;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
        if (Array.isArray(value)) return value.map(item => readable(item, depth + 1)).filter(Boolean).join(' ')
        if (value && typeof value === 'object') {
            const item = value as Record<string, unknown>
            return [readable(item.content, depth + 1), readable(item.items, depth + 1)].filter(Boolean).join(' ')
        }
        return ''
    }
    return description.blocks.map(block => block.type === 'inlineCode' && typeof block.data.text === 'string'
        ? block.data.text
        : [readable(block.data.text), readable(block.data.items)].filter(Boolean).join(' ')
    ).filter(Boolean).join(' ')
}
