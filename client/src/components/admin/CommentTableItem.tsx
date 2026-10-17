import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, LoaderCircle, Trash2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import type { CommentData } from '../../assets/assets'
import { errorMessage, formatDate } from '../../lib/format'

interface CommentTableItemProps { comment: CommentData; fetchComments: () => Promise<void>; index: number }
const CommentTableItem = ({ comment, fetchComments }: CommentTableItemProps) => {
  const { axios, userRole } = useAppContext()
  const [busy, setBusy] = useState(false)
  const mutate = async (action: 'approve-comment' | 'delete-comment') => {
    if (action === 'delete-comment' && !window.confirm('Permanently delete this comment?')) return
    setBusy(true)
    try { const { data } = await axios.post(`/api/admin/${action}`, { id: comment._id }); if (!data.success) throw new Error(data.message); toast.success(data.message); await fetchComments() } catch (error) { toast.error(errorMessage(error)) } finally { setBusy(false) }
  }
  return <tr><td><div className="cms-comment-author"><span className="cms-avatar">{comment.name?.charAt(0).toUpperCase() || 'R'}</span><strong>{comment.name || 'Reader'}</strong><span className={`cms-status${comment.isApproved ? ' cms-status-published' : ''}`}><i />{comment.isApproved ? 'Approved' : 'Pending'}</span></div><p className="cms-comment-content">{comment.content}</p><p className="cms-comment-article">On <strong>{comment.blog?.title || 'Removed article'}</strong></p></td><td className="cms-date-cell">{formatDate(comment.createdAt)}</td><td><div className="cms-row-actions">
    {/* Only admin can approve/delete comments */}
    {userRole === 'admin' ? <>{!comment.isApproved && <button disabled={busy} className="cms-button cms-button-secondary cms-small-button" onClick={() => void mutate('approve-comment')}>{busy ? <LoaderCircle size={14} className="cms-spin" /> : <Check size={14} />}Approve</button>}<button disabled={busy} className="cms-icon-button cms-danger" aria-label={`Delete comment by ${comment.name}`} title="Delete comment" onClick={() => void mutate('delete-comment')}><Trash2 size={16} /></button></> : <span className="cms-muted">View only</span>}
  </div></td></tr>
}
export default CommentTableItem
