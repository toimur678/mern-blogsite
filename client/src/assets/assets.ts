// Editor.js block types
export interface EditorBlock {
  id?: string
  type: string
  data: Record<string, unknown>
}
export interface EditorOutputData {
  time?: number
  blocks: EditorBlock[]
  version?: string
}
export interface BlogData {
  _id: string
  title: string
  subTitle?: string
  description: EditorOutputData
  category: string
  image: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string
  authorName?: string
  author?: { name: string } | string
  likes?: string[]
  readTime?: number
  featured?: boolean
  excerpt?: string
  slug?: string
  tags?: string[]
  __v?: number
}
export interface CommentData {
  _id: string
  blog: BlogData | null
  name: string
  content: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  user?: { _id: string; name: string }
  __v?: number
}
export interface DashboardData {
  blogs: number
  comments: number
  drafts: number
  recentBlogs: BlogData[]
  published?: number
  pendingComments?: number
  users?: number
  subscribers?: number
  totalLikes?: number
}
export const blogCategories = ['All', 'Design', 'Technology', 'Culture', 'Lifestyle', 'Startup', 'Finance']

/**
 * Extract plain text from Editor.js output data (for previews and reading time)
 */
export function extractTextFromBlocks(description: EditorOutputData): string {
  const text = (value: unknown): string => {
    if (typeof value === 'string') return value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    if (Array.isArray(value)) return value.map(text).join(' ')
    if (value && typeof value === 'object') {
      const item = value as Record<string, unknown>
      return [text(item.content), text(item.items)].filter(Boolean).join(' ')
    }
    return ''
  }
  return description?.blocks?.map(block => text(block.data.text || block.data.items || block.data.caption)).filter(Boolean).join(' ') || ''
}
