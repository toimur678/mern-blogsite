import assert from 'node:assert/strict'
import test from 'node:test'
import { articleText, booleanValue, emailAddress, escapeRegex, imageUrl, objectId, pagination, passwordValue, record, sanitizeEditorData } from '../utils/validation.js'
import { hasValidImageSignature } from '../controllers/blogController.js'

test('email normalization rejects query objects and malformed addresses', () => {
    assert.equal(emailAddress('  Reader@Example.COM '), 'reader@example.com')
    for (const value of [undefined, {$ne: null}, 'reader', 'a@b', '<x>@example.com', 'a b@example.com']) assert.throws(() => emailAddress(value))
})

test('request validation rejects non-object bodies and operator-shaped IDs', () => {
    for (const body of [null, '', []]) assert.throws(() => record(body))
    assert.equal(objectId('507f1f77bcf86cd799439011'), '507f1f77bcf86cd799439011')
    for (const id of [{$gt: ''}, 'bad-id', 'a'.repeat(25)]) assert.throws(() => objectId(id))
    assert.throws(() => booleanValue('false'))
    assert.equal(booleanValue(undefined, true), true)
})

test('new passwords require eight characters and reject bcrypt byte truncation', () => {
    assert.equal(passwordValue('long-password', true), 'long-password')
    assert.throws(() => passwordValue('short', true))
    assert.throws(() => passwordValue('😀'.repeat(19), true))
    assert.throws(() => passwordValue({$ne: null}))
})

test('pagination bounds expensive queries and rejects arrays, zero, and decimals', () => {
    assert.deepEqual(pagination({page: '2', limit: '8'}), {page: 2, limit: 8, skip: 8})
    for (const query of [{limit: '101'}, {page: '0'}, {page: '-1'}, {page: '1.5'}, {page: ['1']}, {page: '10001'}]) assert.throws(() => pagination(query))
})

test('literal search terms cannot become regular expression patterns', () => {
    const search = new RegExp(escapeRegex('a.*(b)[c]'))
    assert.equal(search.test('a.*(b)[c]'), true)
    assert.equal(search.test('axxxbc'), false)
})

test('editor sanitizer preserves safe inline marks while removing executable markup', () => {
    const output = sanitizeEditorData({blocks: [
        {type: 'header', data: {text: '<img src=x onerror=alert(1)>Title', level: 2, dangerous: true}},
        {type: 'quote', data: {text: '<b>Quote</b>', caption: '<script>x</script>Author'}},
        {type: 'list', data: {items: ['<b>First</b>', {content: '<i>Second</i>'}], style: 'ordered'}},
    ]})
    assert.equal(output.blocks[0].data.text, 'Title')
    assert.equal(output.blocks[0].data.dangerous, undefined)
    assert.equal(output.blocks[1].data.text, '<b>Quote</b>')
    assert.equal(output.blocks[1].data.caption, 'Author')
    assert.deepEqual(output.blocks[2].data.items, ['<b>First</b>', {content: '<i>Second</i>', items: [], meta: {}}])
    assert.equal(articleText(output), 'Title Quote First Second')
})

test('nested Editor.js v2 lists preserve child content, metadata, and plain-text extraction', () => {
    const output = sanitizeEditorData({blocks: [{type: 'list', data: {
        style: 'ordered', meta: {start: 3, counterType: 'lower-alpha'},
        items: [{content: '<b>Parent</b>', meta: {}, items: [{content: '<i>Child</i>', meta: {checked: true}, items: [{content: 'Grandchild', meta: {}, items: []}]}]}],
    }}]})
    const items = output.blocks[0].data.items as {content: string, items: {content: string, items: {content: string}[], meta: {checked: boolean}}[]}[]
    assert.equal(items[0].content, '<b>Parent</b>')
    assert.equal(items[0].items[0].content, '<i>Child</i>')
    assert.equal(items[0].items[0].items[0].content, 'Grandchild')
    assert.equal(items[0].items[0].meta.checked, true)
    assert.deepEqual(output.blocks[0].data.meta, {start: 3, counterType: 'lower-alpha'})
    assert.equal(articleText(output), 'Parent Child Grandchild')
})

test('nested lists reject excessive depth and aggregate item counts', () => {
    let allowed: unknown = {content: 'Leaf', items: []}
    for (let level = 0; level < 7; level++) allowed = {content: 'Parent', items: [allowed]}
    const output = sanitizeEditorData({blocks: [{type: 'list', data: {items: [allowed]}}]})
    assert.equal(articleText(output).split(' ').length, 8)
    let nested: unknown = {content: 'Leaf', items: []}
    for (let level = 0; level < 9; level++) nested = {content: 'Parent', items: [nested]}
    assert.throws(() => sanitizeEditorData({blocks: [{type: 'list', data: {items: [nested]}}]}))
    const list = {type: 'list', data: {items: Array(100).fill('Item')}}
    assert.throws(() => sanitizeEditorData({blocks: Array(11).fill(list)}))
})

test('literal code survives storage and content extraction without becoming HTML', () => {
    const output = sanitizeEditorData({blocks: [{type: 'inlineCode', data: {text: '<Component />'}}]})
    assert.equal(output.blocks[0].data.text, '<Component />')
    assert.equal(articleText(output), '<Component />')
})

test('inline sanitizer strips event handlers, unsafe URL protocols, and raw embedded elements', () => {
    const output = sanitizeEditorData({blocks: [{type: 'paragraph', data: {text: '<a href="javascript:alert(1)" onclick="alert(1)">Unsafe</a><a href="https://example.com" target="_blank">Safe</a><svg><script>bad()</script></svg><strong style="color:red">Bold</strong>'}}]})
    assert.equal(output.blocks[0].data.text, '<a>Unsafe</a><a href="https://example.com">Safe</a><strong>Bold</strong>')
})

test('editor sanitizer rejects malformed blocks, unsupported types, and oversized articles', () => {
    for (const value of [null, {blocks: 'text'}, {blocks: [null]}, {blocks: [{type: 'raw', data: {html: '<script>x</script>'}}]}, {blocks: [{type: 'list', data: {items: [42]}}]}, {blocks: Array(251).fill({type: 'delimiter', data: {}})}]) {
        assert.throws(() => sanitizeEditorData(value))
    }
})

test('cover URLs allow HTTPS without embedded credentials', () => {
    assert.equal(imageUrl('https://example.com/cover.jpg'), 'https://example.com/cover.jpg')
    for (const value of ['javascript:alert(1)', 'http://example.com/a', 'https://user:password@example.com/a']) assert.throws(() => imageUrl(value))
})

test('image validation rejects text disguised with an image MIME type', () => {
    assert.equal(hasValidImageSignature({buffer: Buffer.from('<script>alert(1)</script>'), mimetype: 'image/png'}), false)
    assert.equal(hasValidImageSignature({buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]), mimetype: 'image/png'}), true)
    assert.equal(hasValidImageSignature({buffer: Buffer.from('GIF89a content'), mimetype: 'image/gif'}), true)
})
