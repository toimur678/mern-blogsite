import { createElement, type ReactNode } from 'react'
import { EditorOutputData } from '../assets/assets'

interface EditorRendererProps {
  data: EditorOutputData
}

function inlineText(text: unknown): ReactNode {
  if (typeof text !== 'string') return null
  if (!/[<&]/.test(text)) return text
  const parsed = new DOMParser().parseFromString(text, 'text/html')
  const renderNode = (node: ChildNode, key: number): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent
    if (!(node instanceof HTMLElement)) return null
    const children = Array.from(node.childNodes).map(renderNode)
    const tag = node.tagName.toLowerCase()
    if (['script', 'style', 'iframe', 'object', 'svg'].includes(tag)) return null
    if (['strong', 'b', 'em', 'i', 'code', 'u', 's', 'mark', 'br'].includes(tag)) {
      return createElement(tag, { key }, tag === 'br' ? undefined : children)
    }
    if (tag === 'a') {
      const href = node.getAttribute('href') || ''
      if (/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) {
        return <a key={key} href={href} rel="noopener noreferrer">{children}</a>
      }
    }
    return <span key={key}>{children}</span>
  }
  return Array.from(parsed.body.childNodes).map(renderNode)
}

function listItems(items: unknown): ReactNode {
  if (!Array.isArray(items)) return null
  return items.map((item, index) => {
    if (typeof item === 'string') return <li key={index}>{inlineText(item)}</li>
    if (!item || typeof item !== 'object') return null
    const entry = item as { content?: string; items?: unknown[] }
    return <li key={index}>{inlineText(entry.content)}{entry.items?.length ? <ul>{listItems(entry.items)}</ul> : null}</li>
  })
}

/**
 * Renders Editor.js JSON blocks as safe React elements.
 * No dangerouslySetInnerHTML — all content is rendered as text nodes.
 */
const EditorRenderer = ({ data }: EditorRendererProps) => {
  if (!Array.isArray(data?.blocks)) return null

  return (
    <div className="rich-text reader-prose">
      {data.blocks.map((block, index) => {
        const key = block.id || index
        switch (block.type) {
          case 'header': {
            const level = Math.min(6, Math.max(2, Number(block.data.level) || 2))
            return createElement(`h${level}`, { key, id: `section-${index}` }, inlineText(block.data.text))
          }
          case 'paragraph':
            return <p key={key}>{inlineText(block.data.text)}</p>
          case 'list':
            return block.data.style === 'ordered'
              ? <ol key={key}>{listItems(block.data.items)}</ol>
              : <ul key={key}>{listItems(block.data.items)}</ul>
          case 'quote':
            return <blockquote key={key}><p>{inlineText(block.data.text)}</p>{typeof block.data.caption === 'string' && block.data.caption && <cite>{inlineText(block.data.caption)}</cite>}</blockquote>
          case 'delimiter':
            return <hr key={key} />
          case 'inlineCode':
            return <pre key={key}><code>{typeof block.data.text === 'string' ? block.data.text : ''}</code></pre>
          default:
            return null
        }
      })}
    </div>
  )
}

export default EditorRenderer
