import { useCallback, useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import CommentTableItem from '../../components/admin/CommentTableItem'
import { CmsEmpty, CmsError, CmsLoading, CmsPageHeading, CmsPagination } from '../../components/admin/CmsUI'
import { useAppContext } from '../../context/AppContext'
import type { CommentData } from '../../assets/assets'
import { errorMessage } from '../../lib/format'

const Comments = () => {
  const { axios, userRole } = useAppContext()
  const [comments, setComments] = useState<CommentData[]>([])
  const [status, setStatus] = useState('pending')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const requestVersion = useRef(0)
  const fetchComments = useCallback(async () => {
    const version = ++requestVersion.current
    setError(''); setLoading(true)
    try { const { data } = await axios.get('/api/admin/comments', { params: { page, limit: 10, status: status === 'all' ? undefined : status, search } }); if (version !== requestVersion.current) return; if (!data.success) throw new Error(data.message); setComments(data.comments || []); setTotal(data.pagination?.total ?? data.comments.length); if (data.pagination?.pages && page > data.pagination.pages) setPage(data.pagination.pages) } catch (err) { if (version === requestVersion.current) setError(errorMessage(err)) } finally { if (version === requestVersion.current) setLoading(false) }
  }, [axios, page, status, search])
  useEffect(() => { void fetchComments(); return () => { requestVersion.current += 1 } }, [fetchComments])
  useEffect(() => { const timer = window.setTimeout(() => { setSearch(query); setPage(1) }, 250); return () => window.clearTimeout(timer) }, [query])
  return <section className="cms-page"><CmsPageHeading title="Keep the conversation thoughtful." description="A little moderation makes room for a better exchange of ideas." />{userRole === 'editor' && <p className="cms-info-note">You can read all comments. An administrator manages approvals and removals.</p>}
    <div className="cms-list-panel"><div className="cms-list-tabs" role="group" aria-label="Filter comments">{[['pending', 'Awaiting review'], ['approved', 'Approved'], ['all', 'All comments']].map(([key, label]) => <button key={key} className={`cms-tab${status === key ? ' cms-tab-active' : ''}`} aria-pressed={status === key} onClick={() => { setStatus(key); setPage(1) }}>{label}</button>)}</div><div className="cms-list-toolbar"><label className="cms-search"><Search size={17} /><input aria-label="Search comments" placeholder="Search comments or readers…" value={query} onChange={event => setQuery(event.target.value)} /></label><span className="cms-result-label">{total} {status === 'pending' ? 'awaiting review' : 'comments'}</span></div>
    {error && <CmsError message={error} retry={() => void fetchComments()} />}{loading ? <CmsLoading label="Loading conversations…" /> : comments.length ? <><div className="cms-table-scroll"><table className="cms-table cms-comments-table"><thead><tr><th scope="col">Conversation</th><th scope="col">Received</th><th scope="col">Moderation</th></tr></thead><tbody>{comments.map((comment, index) => <CommentTableItem key={comment._id} comment={comment} index={index} fetchComments={fetchComments} />)}</tbody></table></div><CmsPagination page={page} total={total} pageSize={10} onChange={setPage} /></> : !error && <CmsEmpty title={search ? 'No matching conversations' : status === 'pending' ? 'You’re all caught up.' : 'The conversation starts with your readers.'} description={search ? 'Try a different name or search term.' : status === 'pending' ? 'No comments are waiting for review. A clear desk feels good.' : 'Reader comments will appear here as your publication grows.'} />}</div>
  </section>
}
export default Comments
