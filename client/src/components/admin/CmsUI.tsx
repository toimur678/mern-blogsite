import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, AlertCircle, LoaderCircle, SearchX } from 'lucide-react'

export const CmsPageHeading = ({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description: string; children?: ReactNode }) => <div className="cms-page-heading"><div><p className="cms-eyebrow">{eyebrow || 'Editorial studio'}</p><h1>{title}</h1><p className="cms-page-description">{description}</p></div><div className="cms-page-actions">{children}</div></div>
export const CmsLoading = ({ label = 'Loading your workspace…' }: { label?: string }) => <div className="cms-loading" role="status"><LoaderCircle size={22} className="cms-spin" /><p>{label}</p></div>
export const CmsEmpty = ({ title, description, children }: { title: string; description: string; children?: ReactNode }) => <div className="cms-empty"><SearchX size={26} strokeWidth={1.4} /><h3>{title}</h3><p>{description}</p>{children}</div>
export const CmsError = ({ message, retry }: { message: string; retry?: () => void }) => <div className="cms-error" role="alert"><AlertCircle size={19} /><p>{message}</p>{retry && <button type="button" className="cms-text-button" onClick={retry}>Try again</button>}</div>
export const CmsPagination = ({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (page: number) => void }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return <div className="cms-pagination"><span>{total === 0 ? '0 results' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}</span><div><button className="cms-icon-button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ArrowLeft size={16} /></button><span>Page {page} of {pages}</span><button className="cms-icon-button" aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}><ArrowRight size={16} /></button></div></div>
}
