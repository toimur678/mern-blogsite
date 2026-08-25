import { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BlogData } from '../assets/assets'
import toast from 'react-hot-toast'
import { Heart, MessageSquare, Trash2, Edit3, X, Check } from 'lucide-react'

interface CommentData {
  _id: string
  blog: { _id: string, title: string }
  content: string
  createdAt: string
}

const UserProfile = () => {
  const { axios, userData, navigate, isLoggedIn } = useAppContext()
  const [likedBlogs, setLikedBlogs] = useState<BlogData[]>([])
  const [comments, setComments] = useState<CommentData[]>([])
  const [activeTab, setActiveTab] = useState<'likes' | 'comments'>('likes')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    fetchLikedBlogs()
    fetchComments()
  }, [isLoggedIn])

  const fetchLikedBlogs = async () => {
    try {
      const { data } = await axios.get('/api/user/liked-blogs')
      if (data.success) {
        setLikedBlogs(data.blogs)
      }
    } catch (error) {
      toast.error('Failed to load liked blogs')
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await axios.get('/api/user/comments')
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      toast.error('Failed to load comments')
    }
  }

  const handleUnlike = async (id: string) => {
    try {
      const { data } = await axios.post('/api/blog/unlike', { id })
      if (data.success) {
        setLikedBlogs(likedBlogs.filter(blog => blog._id !== id))
        toast.success('Removed from liked posts')
      }
    } catch (error) {
      toast.error('Error unliking blog')
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    try {
      const { data } = await axios.post('/api/blog/delete-comment', { commentId: id })
      if (data.success) {
        setComments(comments.filter(c => c._id !== id))
        toast.success('Comment deleted')
      }
    } catch (error) {
      toast.error('Error deleting comment')
    }
  }

  const handleEditComment = async (id: string) => {
    try {
      const { data } = await axios.post('/api/blog/edit-comment', { commentId: id, content: editContent })
      if (data.success) {
        setComments(comments.map(c => c._id === id ? { ...c, content: editContent } : c))
        setEditingComment(null)
        toast.success('Comment updated')
      }
    } catch (error) {
      toast.error('Error updating comment')
    }
  }

  return (
    <>
      <Navbar />
      <div className='min-h-screen bg-surface-teal pt-12 pb-24'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          
          {/* Header */}
          <div className='bg-white rounded-3xl shadow-sm border border-border p-8 mb-8 flex flex-col md:flex-row items-center justify-between'>
            <div className='flex items-center gap-6'>
              <div className='w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold'>
                {userData?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className='text-3xl font-heading font-bold text-navy'>{userData?.name}</h1>
                <p className='text-navy/60'>{userData?.email}</p>
                <div className='mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider'>
                  {userData?.role}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex space-x-4 mb-6'>
            <button
              onClick={() => setActiveTab('likes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'likes' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-navy/70 hover:bg-surface border border-border'
              }`}
            >
              <Heart size={18} className={activeTab === 'likes' ? 'fill-current' : ''} />
              Liked Posts
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'comments' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-navy/70 hover:bg-surface border border-border'
              }`}
            >
              <MessageSquare size={18} className={activeTab === 'comments' ? 'fill-current' : ''} />
              My Comments
            </button>
          </div>

          {/* Content area */}
          <div className='bg-white rounded-3xl shadow-sm border border-border p-6 sm:p-8 min-h-[400px]'>
            
            {activeTab === 'likes' && (
              <div>
                <h2 className='text-xl font-bold text-navy mb-6'>Blogs You Liked ({likedBlogs.length})</h2>
                {likedBlogs.length === 0 ? (
                  <p className='text-navy/50 text-center py-12'>You haven't liked any posts yet.</p>
                ) : (
                  <div className='grid gap-6'>
                    {likedBlogs.map(blog => (
                      <div key={blog._id} className='flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/30 transition-colors group'>
                        <div className='flex items-center gap-4 cursor-pointer flex-1' onClick={() => navigate(`/blog/${blog._id}`)}>
                          <img src={blog.image} alt={blog.title} className='w-20 h-20 rounded-xl object-cover' />
                          <div>
                            <h3 className='font-bold text-navy group-hover:text-primary transition-colors line-clamp-1'>{blog.title}</h3>
                            <p className='text-sm text-navy/60'>{new Date(blog.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUnlike(blog._id)}
                          className='p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors ml-4'
                          title='Unlike post'
                        >
                          <Heart size={20} className='fill-current' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div>
                <h2 className='text-xl font-bold text-navy mb-6'>Your Comments ({comments.length})</h2>
                {comments.length === 0 ? (
                  <p className='text-navy/50 text-center py-12'>You haven't commented on any posts yet.</p>
                ) : (
                  <div className='space-y-6'>
                    {comments.map(comment => (
                      <div key={comment._id} className='p-5 rounded-2xl border border-border bg-surface-teal/30'>
                        <div className='flex justify-between items-start mb-3'>
                          <div>
                            <p className='text-sm text-navy/60'>
                              Commented on <span className='font-medium text-navy cursor-pointer hover:text-primary' onClick={() => navigate(`/blog/${comment.blog._id}`)}>{comment.blog.title}</span>
                            </p>
                            <p className='text-xs text-navy/40 mt-1'>{new Date(comment.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <div className='flex gap-2'>
                            {editingComment !== comment._id ? (
                              <>
                                <button onClick={() => { setEditingComment(comment._id); setEditContent(comment.content) }} className='p-2 text-navy/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors'>
                                  <Edit3 size={16} />
                                </button>
                                <button onClick={() => handleDeleteComment(comment._id)} className='p-2 text-navy/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                        
                        {editingComment === comment._id ? (
                          <div className='mt-3 bg-white p-2 rounded-xl border border-primary/30 shadow-inner'>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className='w-full p-2 outline-none resize-none text-navy'
                              rows={3}
                            />
                            <div className='flex justify-end gap-2 mt-2'>
                              <button onClick={() => setEditingComment(null)} className='flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg text-navy hover:bg-surface transition-colors'>
                                <X size={14} /> Cancel
                              </button>
                              <button onClick={() => handleEditComment(comment._id)} className='flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors'>
                                <Check size={14} /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className='text-navy'>{comment.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}

export default UserProfile
