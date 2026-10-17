import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Calendar, Check, ChevronRight, Clock, Copy, Edit3, Heart, MessageCircle, Share2, Trash2, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import EditorRenderer from '../components/EditorRenderer'
import { useAppContext } from '../context/AppContext'
import { BlogData } from '../assets/assets'
import { authorName, errorMessage, formatDate, initials, readingTime } from '../lib/format'
import toast from 'react-hot-toast'
import '../reader.css'

interface BlogComment {
  _id: string
  name: string
  content: string
  createdAt: string
  isApproved: boolean
  user?: { _id: string; name: string } | string
}

const Blog = () => {
  const { id } = useParams<{ id: string }>()
  const { axios, isLoggedIn, userData, blogs, blogsLoading, savedIds, toggleSaved } = useAppContext()
  const [data, setData] = useState<BlogData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [commentsRetry, setCommentsRetry] = useState(0)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsError, setCommentsError] = useState('')
  const [content, setContent] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [likeBusy, setLikeBusy] = useState(false)
  const [commentBusy, setCommentBusy] = useState(false)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [deleteComment, setDeleteComment] = useState<string | null>(null)
  const isDemo = !!id?.startsWith('demo-')
  const demoLoading = isDemo && blogsLoading
  const demoBlog = isDemo ? blogs.find(blog => blog._id === id) : undefined
  const userId = userData?.id
  const signInPath = `/login?returnTo=${encodeURIComponent(`/blog/${id}`)}`

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    setData(null)
    setContent('')
    setEditingComment(null)
    setDeleteComment(null)
    if (isDemo) {
      if (!demoLoading) {
        setData(demoBlog || null)
        setError(demoBlog ? '' : 'This story could not be found. It may have been moved or unpublished.')
        setLoading(false)
      }
      return () => controller.abort()
    }
    const load = async () => {
      try {
        const response = await axios.get(`/api/blog/${id}`, { signal: controller.signal })
        if (!response.data.success || !response.data.blog) throw new Error(response.data.message || 'This story could not be found.')
        if (!controller.signal.aborted) setData(response.data.blog)
      } catch (cause) {
        if (!controller.signal.aborted) setError(errorMessage(cause))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [axios, id, isDemo, demoBlog, demoLoading, retry])

  useEffect(() => {
    setLikesCount(data?.likes?.length || 0)
    setIsLiked(!!userId && !!data?.likes?.includes(userId))
  }, [data, userId])

  useEffect(() => {
    const controller = new AbortController()
    setComments([])
    setCommentsError('')
    if (isDemo) {
      setCommentsLoading(false)
      return () => controller.abort()
    }
    setCommentsLoading(true)
    const load = async () => {
      try {
        const response = await axios.post('/api/blog/comments', { blogId: id }, { signal: controller.signal })
        if (!response.data.success) throw new Error(response.data.message || 'Unable to load the conversation.')
        if (!controller.signal.aborted) setComments(response.data.comments || [])
      } catch (cause) {
        if (!controller.signal.aborted) setCommentsError(errorMessage(cause))
      } finally {
        if (!controller.signal.aborted) setCommentsLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [axios, id, isDemo, userId, commentsRetry]) // Refetch if userData changes so likes sync up

  useEffect(() => {
    if (!data) return
    const previousTitle = document.title
    document.title = `${data.title} — folio.`
    return () => { document.title = previousTitle }
  }, [data])

  const handleLike = async () => {
    if (isDemo || likeBusy || !isLoggedIn || !userId) return
    setLikeBusy(true)
    try {
      const response = await axios.post(`/api/blog/${isLiked ? 'unlike' : 'like'}`, { id })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to update your appreciation.')
      if (Array.isArray(response.data.likes)) {
        setLikesCount(response.data.likes.length)
        setIsLiked(response.data.likes.includes(userId))
      } else {
        setLikesCount(previous => Math.max(0, previous + (isLiked ? -1 : 1)))
        setIsLiked(value => !value)
      }
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setLikeBusy(false)
    }
  }

  const addComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isLoggedIn || isDemo || commentBusy || !content.trim()) return
    setCommentBusy(true)
    try {
      const response = await axios.post('/api/blog/add-comment', { blog: id, content: content.trim() })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to send your comment.')
      setContent('')
      if (response.data.comment) {
        setComments(previous => [{ ...response.data.comment, user: { _id: userId, name: userData?.name } }, ...previous])
      } else {
        setCommentsRetry(value => value + 1) // Refresh comments to get the newly added one
      }
      toast.success('Comment sent for review. Thank you for joining in.')
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setCommentBusy(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setActionBusy(commentId)
    try {
      const response = await axios.post('/api/blog/delete-comment', { commentId })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to delete this comment.')
      setComments(previous => previous.filter(comment => comment._id !== commentId))
      setDeleteComment(null)
      toast.success('Comment deleted.')
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setActionBusy(null)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return
    setActionBusy(commentId)
    try {
      const response = await axios.post('/api/blog/edit-comment', { commentId, content: editContent.trim() })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to update this comment.')
      setComments(previous => previous.map(comment => comment._id === commentId ? { ...comment, ...response.data.comment, content: editContent.trim(), isApproved: false } : comment))
      setEditingComment(null)
      toast.success('Comment updated and sent for review.')
    } catch (cause) {
      toast.error(errorMessage(cause))
    } finally {
      setActionBusy(null)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Story link copied.')
    } catch {
      toast.error('Could not copy. You can copy this story’s address from your browser.')
    }
  }

  const shareStory = async () => {
    if (!navigator.share) return copyLink()
    try {
      await navigator.share({ title: data?.title, url: window.location.href })
    } catch (cause) {
      if (cause instanceof Error && cause.name !== 'AbortError') toast.error('Unable to share this story. Try copying its link.')
    }
  }

  const headings = data?.description?.blocks?.flatMap((block, index) => block.type === 'header' && typeof block.data.text === 'string' ? [{ id: `section-${index}`, text: block.data.text.replace(/<[^>]*>/g, '') }] : []) || []
  const related = blogs.filter(blog => blog._id !== id).sort((a, b) => Number(b.category === data?.category) - Number(a.category === data?.category)).slice(0, 3)

  return (
    <div className="reader-page">
      <Navbar />
      {loading ? <main id="main-content" className="reader-state" aria-busy="true"><span className="reader-eyebrow">A moment for a good story</span><div className="reader-skeleton-title" /><div className="reader-skeleton-line" /><div className="reader-skeleton-image" /><p role="status">Opening the story…</p></main> : !data ? <main id="main-content" className="reader-state"><span className="reader-eyebrow">Something’s missing</span><h1>This chapter is unavailable.</h1><p role="alert">{error || 'This story may have been moved or unpublished.'}</p><div className="reader-inline-actions"><Link to="/" className="reader-primary"><ArrowLeft size={16} /> Back to the journal</Link><button className="reader-secondary" onClick={() => setRetry(value => value + 1)}>Try again</button></div></main> : <main id="main-content">
        {/* Hero Header */}
        <header className="reader-header reader-container">
          <nav className="reader-breadcrumb" aria-label="Breadcrumb"><Link to="/">The journal</Link><ChevronRight size={12} /><Link to={`/?category=${encodeURIComponent(data.category)}#stories`}>{data.category}</Link></nav>
          {/* Category Pill */}
          <div className="reader-kicker">
            <Link to={`/?category=${encodeURIComponent(data.category)}#stories`} className="reader-category-pill">{data.category}</Link>
          </div>
          {/* Title */}
          <h1>{data.title}</h1>
          {/* Subtitle */}
          {data.subTitle && <p className="reader-deck">{data.subTitle}</p>}
          {/* Author Badge & Meta Bar */}
          <div className="reader-byline-row">
            <div className="reader-byline-group">
              <div className="reader-byline">
                <span className="reader-avatar">{initials(authorName(data))}</span>
                <div>
                  <strong>{authorName(data)}</strong>
                  <span>Editorial contributor</span>
                </div>
              </div>
              <div className="reader-meta-items">
                <span className="reader-meta-chip"><Calendar size={14} />{formatDate(data.publishedAt || data.createdAt)}</span>
                <span className="reader-meta-chip"><Clock size={14} />{readingTime(data)} min read</span>
              </div>
            </div>
            <div className="reader-actions">
              <button className={`reader-icon-button ${savedIds.includes(data._id) ? 'reader-selected' : ''}`} onClick={() => toggleSaved(data._id)} aria-label={savedIds.includes(data._id) ? 'Remove from saved stories' : 'Save story'} aria-pressed={savedIds.includes(data._id)}><Bookmark size={18} fill={savedIds.includes(data._id) ? 'currentColor' : 'none'} /><span>{savedIds.includes(data._id) ? 'Saved' : 'Save'}</span></button>
              <button className="reader-icon-button" onClick={shareStory}><Share2 size={18} /><span>Share</span></button>
            </div>
          </div>
        </header>
        {/* Content */}
          {/* Featured Image */}
          <figure className="reader-cover reader-container"><img src={data.image} alt={data.title} fetchPriority="high" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/quiet-spaces.jpg' }} /><figcaption>A story from the folio. journal<span>{data.category} / {new Date(data.createdAt).getFullYear()}</span></figcaption></figure>
          <div className="reader-content-grid reader-container">
            <div className="reader-body-column">
              {isDemo && <p className="reader-demo-note">A sample from the folio. journal. Save this story for later; conversations are available in the live edition.</p>}
              {/* Rich Text Content — Safe JSON Renderer */}
              <EditorRenderer data={data.description} />
              <div className="reader-end-mark" aria-hidden="true">f.</div>
              {data.tags?.length ? <div className="reader-tags">{data.tags.map(tag => <span key={tag}>{tag}</span>)}</div> : null}
              {/* Share Buttons */}
              <div className="reader-story-end"><div>{isLoggedIn || isDemo ? <button className={`reader-icon-button ${isLiked ? 'reader-selected' : ''}`} onClick={handleLike} disabled={isDemo || likeBusy || !userId} title={isDemo ? 'Appreciations are available in the live edition.' : !userId ? 'Appreciations are available with a registered reader account.' : undefined} aria-pressed={isLiked} aria-label={isLiked ? 'Remove appreciation' : 'Appreciate story'}><Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />{likesCount} <span>appreciations</span></button> : <Link to={signInPath} className="reader-icon-button"><Heart size={18} />{likesCount} <span>appreciations</span></Link>}<a className="reader-icon-button" href="#conversation"><MessageCircle size={18} />{comments.length}</a></div><button className="reader-icon-button" onClick={copyLink}><Copy size={17} /><span>Copy link</span></button></div>
              <div className="reader-author-note"><span className="reader-avatar reader-avatar-large">{initials(authorName(data))}</span><div><span className="reader-eyebrow">Words by</span><h3>{authorName(data)}</h3><p>Part of the folio. community. Sharing ideas for a more considered, curious life.</p></div></div>
              {/* Comment Section */}
              <section className="reader-conversation" id="conversation" aria-labelledby="conversation-heading"><div className="reader-section-heading"><h2 id="conversation-heading">The conversation<span>{comments.length}</span></h2><MessageCircle size={23} /></div><p className="reader-conversation-intro">A good story is only the beginning. What’s your perspective?</p>
                {/* Add Comment Section */}
                {isDemo ? <div className="reader-note">The conversation continues in the live edition. In the meantime, explore the journal and save your favorite stories.</div> : isLoggedIn && !userId ? <div className="reader-signin-note"><div><strong>You’re signed in to the studio.</strong><p>Conversations and appreciations are available with a registered reader account.</p></div><Link className="reader-secondary" to="/profile">Your account<ArrowUpRight size={16} /></Link></div> : isLoggedIn ? <form onSubmit={addComment} className="reader-comment-form"><label htmlFor="new-comment">Add your perspective</label><textarea id="new-comment" placeholder="Something this story made you think about…" value={content} onChange={event => setContent(event.target.value)} required maxLength={2000} rows={4} disabled={commentBusy} /><div><span>Comments are reviewed before appearing publicly.</span><button className="reader-primary" disabled={commentBusy || !content.trim()} type="submit">{commentBusy ? 'Sending…' : 'Post comment'}<ArrowUpRight size={16} /></button></div></form> : <div className="reader-signin-note"><div><strong>Your perspective belongs here.</strong><p>Sign in to appreciate stories and join the conversation.</p></div><Link className="reader-primary" to={signInPath}>Join in<ArrowUpRight size={16} /></Link></div>}
                {commentsLoading ? <p className="reader-comments-status" role="status">Loading the conversation…</p> : commentsError ? <div className="reader-comments-status"><p className="reader-error" role="alert">{commentsError}</p><button className="reader-secondary" onClick={() => setCommentsRetry(value => value + 1)}>Reload comments</button></div> : !comments.length && !isDemo ? <p className="reader-comments-status">No comments yet. You could start something good.</p> : <div className="reader-comments">{comments.map(item => {
                  const commentUser = typeof item.user === 'object' ? item.user : undefined
                  const isOwner = !!userId && (commentUser?._id === userId || item.user === userId)
                  const displayName = commentUser?.name || item.name || 'A reader'
                  return <article className="reader-comment" key={item._id}><div className="reader-comment-header">
                    {/* Avatar Circle */}
                    <span className="reader-avatar">{initials(displayName)}</span><div className="reader-comment-person"><strong>{displayName}</strong><span>{formatDate(item.createdAt)}{!item.isApproved && <em>Awaiting review</em>}</span></div>{isOwner && editingComment !== item._id && <div className="reader-comment-tools"><button className="reader-icon-button" aria-label="Edit your comment" onClick={() => { setEditingComment(item._id); setEditContent(item.content); setDeleteComment(null) }}><Edit3 size={15} /></button><button className="reader-icon-button" aria-label="Delete your comment" onClick={() => setDeleteComment(item._id)}><Trash2 size={15} /></button></div>}</div>
                    {editingComment === item._id ? <form className="reader-comment-edit" onSubmit={event => { event.preventDefault(); void handleEditComment(item._id) }}><label className="reader-sr-only" htmlFor={`edit-${item._id}`}>Edit your comment</label><textarea id={`edit-${item._id}`} value={editContent} onChange={event => setEditContent(event.target.value)} rows={3} required maxLength={2000} disabled={actionBusy === item._id} /><div className="reader-inline-actions"><button className="reader-secondary" type="button" onClick={() => setEditingComment(null)} disabled={actionBusy === item._id}><X size={14} />Cancel</button><button className="reader-primary" type="submit" disabled={actionBusy === item._id || !editContent.trim()}><Check size={14} />{actionBusy === item._id ? 'Saving…' : 'Save comment'}</button></div></form> : <p className="reader-comment-text">{item.content}</p>}
                    {deleteComment === item._id && <div className="reader-delete-confirm"><span>Delete your comment permanently?</span><button className="reader-text-button" onClick={() => setDeleteComment(null)} disabled={actionBusy === item._id}>Keep it</button><button className="reader-danger" onClick={() => handleDeleteComment(item._id)} disabled={actionBusy === item._id}>{actionBusy === item._id ? 'Deleting…' : 'Delete'}</button></div>}
                  </article>
                })}</div>}
              </section>
            </div>
            <aside className="reader-margin">
              <div className="reader-margin-sticky">
                <div className="reader-share-box">
                  <span className="reader-share-label">Share:</span>
                  <div className="reader-share-circles">
                    <button type="button" className="reader-share-circle" onClick={copyLink} aria-label="Copy story link" title="Copy link"><Copy size={15} /></button>
                    <button type="button" className="reader-share-circle" onClick={shareStory} aria-label="Share story" title="Share"><Share2 size={15} /></button>
                    <button type="button" className={`reader-share-circle ${savedIds.includes(data._id) ? 'is-active' : ''}`} onClick={() => toggleSaved(data._id)} aria-label={savedIds.includes(data._id) ? 'Unsave story' : 'Save story'} aria-pressed={savedIds.includes(data._id)} title="Bookmark"><Bookmark size={15} fill={savedIds.includes(data._id) ? 'currentColor' : 'none'} /></button>
                    <a className="reader-share-circle" href="#conversation" aria-label="Jump to conversation" title="Comments"><MessageCircle size={15} /></a>
                  </div>
                </div>
                {headings.length > 1 && <nav aria-label="In this story"><span className="reader-eyebrow">In this story</span>{headings.map(heading => <a key={heading.id} href={`#${heading.id}`}>{heading.text}</a>)}</nav>}
                <div className="reader-margin-card">
                  <span className="reader-eyebrow">Worth a moment</span>
                  <p>Ideas to sit with.<br />Stories to come back to.</p>
                  <button className="reader-margin-save" onClick={() => toggleSaved(data._id)}><Bookmark size={15} fill={savedIds.includes(data._id) ? 'currentColor' : 'none'} />{savedIds.includes(data._id) ? 'Saved for later' : 'Keep for later'}</button>
                </div>
              </div>
            </aside>
          </div>
          {related.length > 0 && <section className="reader-related reader-container"><div className="reader-related-heading"><div><span className="reader-eyebrow">Keep wandering</span><h2>Related blogs</h2></div><Link className="reader-view-all" to="/#stories">View all <ArrowRight size={15} /></Link></div><div className="reader-related-grid">{related.map(story => <Link to={`/blog/${story._id}`} className="reader-related-card" key={story._id}><div className="reader-related-media"><img src={story.image} alt="" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/quiet-spaces.jpg' }} /><span className="reader-related-pill">{story.category}</span></div><p>{formatDate(story.publishedAt || story.createdAt)}<span>•</span>{readingTime(story)} min read</p><h3>{story.title}</h3><span className="reader-related-more">Read more <ArrowRight size={13} /></span></Link>)}</div></section>}
        </main>}
      <Footer />
    </div>
  )
}

export default Blog

