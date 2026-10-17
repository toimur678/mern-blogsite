import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BlogData } from '../assets/assets'
import { ArrowUpRight, Bookmark, Check, Edit3, Heart, LogOut, MessageCircle, Trash2, X } from 'lucide-react'
import { authorName, errorMessage, formatDate, initials, readingTime } from '../lib/format'
import toast from 'react-hot-toast'
import '../reader.css'

interface CommentData {
  _id: string
  blog: { _id: string; title: string } | null
  content: string
  createdAt: string
  isApproved?: boolean
}

type ProfileTab = 'saved' | 'likes' | 'comments'

const UserProfile = () => {
  const { axios, userData, isLoggedIn, authLoading, blogs, blogsLoading, blogsError, refreshBlogs, savedIds, toggleSaved, logout } = useAppContext()
  const [likedBlogs, setLikedBlogs] = useState<BlogData[]>([])
  const [comments, setComments] = useState<CommentData[]>([])
  const [activeTab, setActiveTab] = useState<ProfileTab>('saved')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteComment, setDeleteComment] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [loading, setLoading] = useState(false)
  const [likesError, setLikesError] = useState('')
  const [commentsError, setCommentsError] = useState('')
  const [retry, setRetry] = useState(0)
  const userId = userData?.id
  const savedBlogs = savedIds.flatMap(id => { const blog = blogs.find(item => item._id === id); return blog ? [blog] : [] })
  const missingSaved = savedIds.filter(id => !blogs.some(blog => blog._id === id))

  useEffect(() => {
    const controller = new AbortController()
    if (!isLoggedIn || !userId) {
      setLikedBlogs([])
      setComments([])
      setLoading(false)
      return () => controller.abort()
    }
    setLoading(true)
    setLikesError('')
    setCommentsError('')
    const load = async () => {
      const results = await Promise.allSettled([
        axios.get('/api/user/liked-blogs', { signal: controller.signal }),
        axios.get('/api/user/comments', { signal: controller.signal }),
      ])
      if (controller.signal.aborted) return
      const [likesResult, commentsResult] = results
      if (likesResult.status === 'fulfilled' && likesResult.value.data.success) setLikedBlogs(likesResult.value.data.blogs || [])
      else setLikesError(likesResult.status === 'rejected' ? errorMessage(likesResult.reason) : likesResult.value.data.message || 'Unable to load your appreciated stories.')
      if (commentsResult.status === 'fulfilled' && commentsResult.value.data.success) setComments(commentsResult.value.data.comments || [])
      else setCommentsError(commentsResult.status === 'rejected' ? errorMessage(commentsResult.reason) : commentsResult.value.data.message || 'Unable to load your comments.')
      setLoading(false)
    }
    void load()
    return () => controller.abort()
  }, [axios, isLoggedIn, userId, retry])

  const handleUnlike = async (id: string) => {
    if (busy) return
    setBusy(id)
    try {
      const { data } = await axios.post('/api/blog/unlike', { id })
      if (!data.success) throw new Error(data.message || 'Unable to remove appreciation.')
      setLikedBlogs(previous => previous.filter(blog => blog._id !== id))
      toast.success('Appreciation removed.')
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setBusy(null)
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (busy) return
    setBusy(id)
    try {
      const { data } = await axios.post('/api/blog/delete-comment', { commentId: id })
      if (!data.success) throw new Error(data.message || 'Unable to delete your comment.')
      setComments(previous => previous.filter(comment => comment._id !== id))
      setDeleteComment(null)
      toast.success('Comment deleted.')
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setBusy(null)
    }
  }

  const handleEditComment = async (event: FormEvent, id: string) => {
    event.preventDefault()
    if (busy || !editContent.trim()) return
    setBusy(id)
    try {
      const { data } = await axios.post('/api/blog/edit-comment', { commentId: id, content: editContent.trim() })
      if (!data.success) throw new Error(data.message || 'Unable to save your comment.')
      setComments(previous => previous.map(comment => comment._id === id ? { ...comment, content: editContent.trim(), isApproved: false } : comment))
      setEditingComment(null)
      toast.success('Comment updated and sent for review.')
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setBusy(null)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await logout() } finally { setLoggingOut(false) }
  }

  const tabError = activeTab === 'saved' ? blogsError : activeTab === 'likes' ? likesError : commentsError
  const shownBlogs = activeTab === 'saved' ? savedBlogs : likedBlogs

  return (
    <div className="reader-page">
      <Navbar />
      <main className="profile-main reader-container" id="main-content">
        {/* Header */}
        <header className="profile-header"><div><span className="reader-eyebrow">A space of your own</span><h1>Your reading room.</h1><p>The stories you keep. The ideas you come back to.</p></div>{isLoggedIn && userData && <div className="profile-account"><span className="reader-avatar reader-avatar-large">{initials(userData.name)}</span><div><strong>{userData.name}</strong><span>{userData.email}</span><small>{userData.role === 'user' ? 'Reader' : userData.role}</small></div></div>}</header>
        {authLoading ? <div className="profile-loading" role="status">Opening your reading room…</div> : <>
          {!isLoggedIn && <div className="profile-signin"><div><h2>Good stories are better together.</h2><p>Your saved stories stay in this browser. Sign in to appreciate articles and keep track of your conversations.</p></div><Link to="/login?returnTo=%2Fprofile" className="reader-primary">Sign in<ArrowUpRight size={16} /></Link></div>}
          {/* Tabs */}
          <div className="profile-tabs" role="tablist" aria-label="Your reading activity" onKeyDown={event => {
            if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const tabs: ProfileTab[] = ['saved', 'likes', 'comments']
            const index = tabs.indexOf(activeTab)
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
            setActiveTab(tabs[next])
            document.getElementById(`profile-tab-${tabs[next]}`)?.focus()
          }}>{([{ id: 'saved', label: 'Saved stories', icon: Bookmark, count: savedBlogs.length }, { id: 'likes', label: 'Appreciated', icon: Heart, count: likedBlogs.length }, { id: 'comments', label: 'Your comments', icon: MessageCircle, count: comments.length }] as const).map(tab => <button key={tab.id} id={`profile-tab-${tab.id}`} type="button" role="tab" tabIndex={activeTab === tab.id ? 0 : -1} aria-selected={activeTab === tab.id} aria-controls="profile-content" onClick={() => setActiveTab(tab.id)}><tab.icon size={17} />{tab.label}<span>{tab.count}</span></button>)}</div>
          {/* Content area */}
          <section className="profile-content" id="profile-content" role="tabpanel" tabIndex={0} aria-labelledby={`profile-tab-${activeTab}`}>
            <div className="profile-section-top"><h2>{activeTab === 'saved' ? 'For a little later.' : activeTab === 'likes' ? 'Stories that stayed with you.' : 'Keep the conversation going.'}</h2><span>{activeTab === 'saved' ? 'Saved on this device' : 'Your activity'}</span></div>
            {activeTab !== 'saved' && !isLoggedIn ? <div className="profile-empty"><span className="reader-avatar reader-avatar-large">{activeTab === 'likes' ? <Heart size={23} /> : <MessageCircle size={23} />}</span><h3>{activeTab === 'likes' ? 'A little appreciation goes a long way.' : 'Your voice, in the conversation.'}</h3><p>Sign in to {activeTab === 'likes' ? 'see the stories you’ve appreciated.' : 'view and manage your comments.'}</p><Link to="/login?returnTo=%2Fprofile" className="reader-primary">Sign in<ArrowUpRight size={16} /></Link></div> : activeTab !== 'saved' && !userId ? <div className="profile-empty"><h3>Your studio account is ready.</h3><p>Appreciations and comments are available with a registered reader account. Head to the studio to manage the journal.</p><Link to="/admin" className="reader-primary">Open the studio<ArrowUpRight size={16} /></Link></div> : ((activeTab === 'saved' && blogsLoading) || (activeTab !== 'saved' && loading)) ? <div className="profile-loading" role="status">Gathering your {activeTab === 'comments' ? 'comments' : 'stories'}…</div> : tabError ? <div className="profile-empty"><h3>A page we couldn’t turn.</h3><p className="reader-error" role="alert">{tabError}</p><button className="reader-secondary" onClick={() => activeTab === 'saved' ? void refreshBlogs() : setRetry(value => value + 1)}>Try again</button></div> : activeTab === 'comments' ? comments.length ? <div className="profile-comments">{comments.map(comment => <article className="profile-comment" key={comment._id}><div className="profile-comment-top"><div>{comment.blog ? <Link to={`/blog/${comment.blog._id}`}>{comment.blog.title}<ArrowUpRight size={13} /></Link> : <span>Story no longer available</span>}<span>{formatDate(comment.createdAt)}<em className={comment.isApproved ? 'profile-approved' : ''}>{comment.isApproved ? 'Published' : 'Awaiting review'}</em></span></div>{editingComment !== comment._id && <div className="reader-comment-tools"><button className="reader-icon-button" aria-label="Edit comment" onClick={() => { setEditingComment(comment._id); setEditContent(comment.content); setDeleteComment(null) }} disabled={!!busy}><Edit3 size={15} /></button><button className="reader-icon-button" aria-label="Delete comment" onClick={() => setDeleteComment(comment._id)} disabled={!!busy}><Trash2 size={15} /></button></div>}</div>{editingComment === comment._id ? <form className="reader-comment-edit" onSubmit={event => handleEditComment(event, comment._id)}><label className="reader-sr-only" htmlFor={`profile-edit-${comment._id}`}>Edit your comment</label><textarea id={`profile-edit-${comment._id}`} value={editContent} onChange={event => setEditContent(event.target.value)} required maxLength={2000} rows={3} disabled={busy === comment._id} /><p className="auth-field-help">Edited comments are reviewed again before appearing publicly.</p><div className="reader-inline-actions"><button type="button" className="reader-secondary" onClick={() => setEditingComment(null)} disabled={!!busy}><X size={14} />Cancel</button><button type="submit" className="reader-primary" disabled={!!busy || !editContent.trim()}><Check size={14} />{busy === comment._id ? 'Saving…' : 'Save comment'}</button></div></form> : <p>{comment.content}</p>}{deleteComment === comment._id && <div className="reader-delete-confirm"><span>Delete your comment permanently?</span><button className="reader-text-button" onClick={() => setDeleteComment(null)} disabled={!!busy}>Keep it</button><button className="reader-danger" onClick={() => handleDeleteComment(comment._id)} disabled={!!busy}>{busy === comment._id ? 'Deleting…' : 'Delete'}</button></div>}</article>)}</div> : <div className="profile-empty"><MessageCircle size={26} /><h3>There’s a conversation waiting.</h3><p>A question, a reflection, a different perspective. Start with a story that moves you.</p><Link className="reader-primary" to="/">Explore the journal<ArrowUpRight size={16} /></Link></div> : <>
              {shownBlogs.length ? <div className="profile-stories">{shownBlogs.map(blog => <article className="profile-story" key={blog._id}><Link to={`/blog/${blog._id}`} className="profile-story-image"><img src={blog.image} alt="" loading="lazy" /></Link><div className="profile-story-copy"><span className="reader-eyebrow">{blog.category}</span><Link to={`/blog/${blog._id}`}><h3>{blog.title}</h3></Link><p>{authorName(blog)}<span>·</span>{readingTime(blog)} min read</p></div><button className="reader-icon-button reader-selected" aria-label={activeTab === 'saved' ? `Remove ${blog.title} from saved stories` : `Remove appreciation for ${blog.title}`} onClick={() => activeTab === 'saved' ? toggleSaved(blog._id) : handleUnlike(blog._id)} disabled={busy === blog._id}>{activeTab === 'saved' ? <Bookmark size={19} fill="currentColor" /> : <Heart size={19} fill="currentColor" />}</button></article>)}</div> : <div className="profile-empty">{activeTab === 'saved' ? <Bookmark size={27} /> : <Heart size={27} />}<h3>{activeTab === 'saved' ? 'Leave a bookmark for your future self.' : 'Found something worth appreciating?'}</h3><p>{activeTab === 'saved' ? 'Tap the bookmark on any story. We’ll keep it here for your next quiet moment.' : 'A little heart on a story lets the writer know it resonated. Find your next good read.'}</p><Link className="reader-primary" to="/">Explore the journal<ArrowUpRight size={16} /></Link></div>}
              {activeTab === 'saved' && missingSaved.length > 0 && <div className="profile-unavailable"><p>{missingSaved.length} saved {missingSaved.length === 1 ? 'story is' : 'stories are'} no longer in the journal.</p><button className="reader-text-button" onClick={() => missingSaved.forEach(id => toggleSaved(id))}>Remove unavailable bookmarks</button></div>}
            </>}
          </section>
          {isLoggedIn && <div className="profile-account-footer"><span>Signed in as {userData?.email}</span><div>{(userData?.role === 'admin' || userData?.role === 'editor') && <Link className="reader-secondary" to="/admin">Open the studio<ArrowUpRight size={15} /></Link>}<button className="reader-text-button" onClick={handleLogout} disabled={loggingOut}><LogOut size={15} />{loggingOut ? 'Signing out…' : 'Sign out'}</button></div></div>}
        </>}
      </main>
      <Footer />
    </div>
  )
}

export default UserProfile
