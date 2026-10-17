import axios from 'axios'
import { extractTextFromBlocks, type BlogData } from '../assets/assets'

export function formatDate(value?: string): string {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Undated'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}
export function readingTime(blog: BlogData): number {
  return blog.readTime || Math.max(1, Math.ceil(extractTextFromBlocks(blog.description).split(/\s+/).filter(Boolean).length / 220))
}
export function authorName(blog: BlogData): string {
  return blog.authorName || (typeof blog.author === 'object' ? blog.author.name : blog.author) || 'Folio editorial'
}
export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'F'
}
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'This is taking longer than expected. Please try again.' : 'Unable to connect. Please try again.')
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
