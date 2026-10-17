import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Edit3, LoaderCircle, Trash2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import type { BlogData } from '../../assets/assets'
import { errorMessage, formatDate } from '../../lib/format'

interface BlogTableItemProps { blog: BlogData; fetchBlogs: () => Promise<void>; index: number }
const BlogTableItem = ({ blog, fetchBlogs }: BlogTableItemProps) => {
  const { axios, userRole, refreshBlogs } = useAppContext()
  const [busy, setBusy] = useState(false)
  const mutate = async (action: 'delete' | 'toggle-publish') => {
    if (action === 'delete' && !window.confirm(`Delete “${blog.title}”? This permanently removes the article and its comments.`)) return
    setBusy(true)
    try {
      const { data } = await axios.post(`/api/blog/${action}`, { id: blog._id })
      if (!data.success) throw new Error(data.message || 'Unable to update article.')
      toast.success(data.message || 'Article updated')
      await fetchBlogs()
      await refreshBlogs()
    } catch (error) { toast.error(errorMessage(error)) } finally { setBusy(false) }
  }
  return <tr>
    <td><div className="cms-article-cell">{blog.image ? <img className="cms-article-thumbnail" src={blog.image} alt="" loading="lazy" /> : <div className="cms-article-thumbnail cms-thumbnail-empty">f.</div>}<div><Link className="cms-article-title" to={`/admin/editBlog/${blog._id}`}>{blog.title}</Link><span className="cms-article-subtitle">{blog.subTitle || 'No excerpt added'}</span></div></div></td>
    <td><span className="cms-category">{blog.category}</span></td><td><span className={`cms-status${blog.isPublished ? ' cms-status-published' : ''}`}><i />{blog.isPublished ? 'Published' : 'Draft'}</span></td><td className="cms-date-cell">{formatDate(blog.createdAt)}</td>
    <td><div className="cms-row-actions"><button disabled={busy} className="cms-text-button cms-publish-action" onClick={() => void mutate('toggle-publish')}>{busy ? <LoaderCircle size={15} className="cms-spin" /> : blog.isPublished ? 'Unpublish' : 'Publish'}</button><Link to={`/admin/editBlog/${blog._id}`} className="cms-icon-button" aria-label={`Edit ${blog.title}`} title="Edit article"><Edit3 size={16} /></Link>{blog.isPublished && <Link to={`/blog/${blog._id}`} className="cms-icon-button" aria-label={`View ${blog.title}`} title="View article"><ArrowUpRight size={16} /></Link>}
      {/* Only admin can delete blogs */}
      {userRole === 'admin' && <button disabled={busy} onClick={() => void mutate('delete')} className="cms-icon-button cms-danger" aria-label={`Delete ${blog.title}`} title="Delete article"><Trash2 size={15} /></button>}
    </div></td>
  </tr>
}
export default BlogTableItem
