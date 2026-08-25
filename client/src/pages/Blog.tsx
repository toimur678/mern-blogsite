import { useEffect, useState, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link2, Share2, Globe, Heart, Edit3, Trash2, X, Check } from 'lucide-react'
import Navbar from '../components/Navbar';
import Moment from 'moment'
import Footer from '../components/Footer'
import Loader from '../components/Loader';
import EditorRenderer from '../components/EditorRenderer';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

interface BlogComment {
  _id: string
  name: string
  content: string
  createdAt: string
  isApproved: boolean
  user?: { _id: string, name: string }
}

interface BlogDataExpanded {
  _id: string
  title: string
  subTitle: string
  description: any
  category: string
  image: string
  isPublished: boolean
  likes: string[]
  createdAt: string
  updatedAt: string
}

const Blog = () => {
  const {id} = useParams<{id: string}>()
  const {axios, isLoggedIn, userData} = useAppContext()
  const navigate = useNavigate()

  const [data, setData] = useState<BlogDataExpanded | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [content, setContent] = useState<string>('');
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const fetchBlogData = async () => {
    try {
      const {data} = await axios.get(`/api/blog/${id}`)
      if(data.success) {
        setData(data.blog)
        setLikesCount(data.blog.likes?.length || 0)
        if (userData && data.blog.likes?.includes(userData.id)) {
          setIsLiked(true)
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const fetchComments = async () => {
    try {
      const {data} = await axios.post('/api/blog/comments', {blogId: id})
      if(data.success) {
        setComments(data.comments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to like this post")
      return
    }
    
    try {
      if (isLiked) {
        const { data } = await axios.post('/api/blog/unlike', { id })
        if (data.success) {
          setIsLiked(false)
          setLikesCount(prev => prev - 1)
        }
      } else {
        const { data } = await axios.post('/api/blog/like', { id })
        if (data.success) {
          setIsLiked(true)
          setLikesCount(prev => prev + 1)
        }
      }
    } catch (error) {
      toast.error('Error toggling like')
    }
  }

  const addComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please log in to comment")
      return
    }
    
    try {
      const {data: resData} = await axios.post('/api/blog/add-comment', {blog: id, content})
      if(resData.success) {
        toast.success(resData.message)
        setContent('')
        fetchComments() // Refresh comments to get the newly added one
      } else {
        toast.error(resData.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    try {
      const { data: resData } = await axios.post('/api/blog/delete-comment', { commentId })
      if (resData.success) {
        setComments(comments.filter(c => c._id !== commentId))
        toast.success('Comment deleted')
      } else {
        toast.error(resData.message)
      }
    } catch (error) {
      toast.error('Error deleting comment')
    }
  }

  const handleEditComment = async (commentId: string) => {
    try {
      const { data: resData } = await axios.post('/api/blog/edit-comment', { commentId, content: editContent })
      if (resData.success) {
        setComments(comments.map(c => c._id === commentId ? { ...c, content: editContent } : c))
        setEditingComment(null)
        toast.success('Comment updated')
      } else {
        toast.error(resData.message)
      }
    } catch (error) {
      toast.error('Error updating comment')
    }
  }

  useEffect(() => {
    fetchBlogData();
    fetchComments();
  }, [id, userData]) // Refetch if userData changes so likes sync up

  return data ? (
    <div className='bg-surface'>
      <Navbar/>
      
      {/* Hero Header */}
      <div className='max-w-[1280px] mx-auto px-8 sm:px-12 xl:px-0 pt-12 sm:pt-20 pb-8 text-center'>
        {/* Date Badge */}
        <span className='inline-block bg-surface-teal text-primary text-xs font-medium uppercase px-4 py-2 rounded-md tracking-wide mb-6'>
          Published on {Moment(data.createdAt).format('MMMM Do YYYY')}
        </span>

        {/* Title */}
        <h1 className='font-heading text-3xl sm:text-[52px] font-medium text-navy max-w-3xl mx-auto leading-[1.08] mb-5'>
          {data.title}
        </h1>

        {/* Subtitle */}
        <p className='text-lg text-[#333333] max-w-xl mx-auto truncate mb-6 leading-[28px]'>
          {data.subTitle}
        </p>

        {/* Author Badge & Like Button */}
        <div className='flex items-center justify-center gap-4'>
          <span className='inline-block bg-surface-teal text-primary text-sm font-medium px-5 py-2 rounded-full'>
            Author
          </span>
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors border ${
              isLiked 
                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' 
                : 'bg-white text-navy border-border hover:bg-surface-teal'
            }`}
          >
            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
            {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-5xl mx-auto px-5 sm:px-8'>
        {/* Featured Image */}
        <img className='w-full rounded-[20px] mb-10 shadow-lg' src={data.image} alt={data.title} />

        {/* Rich Text Content — Safe JSON Renderer */}
        <div className='max-w-3xl mx-auto'>
          <EditorRenderer data={data.description} />
        </div>

        {/* Comment Section */}
        <div className='mt-16 mb-10 max-w-3xl mx-auto'>
          <h3 className='font-heading text-2xl font-bold text-navy mb-6'>
            Comments ({comments.length})
          </h3>
          <div className='flex flex-col gap-4'>
            {comments.map((item) => {
              const isOwner = userData?.id && item.user?._id === userData.id;
              const displayName = item.user?.name || item.name;

              return (
                <div 
                  className='bg-surface-teal/30 border border-border-teal p-5 rounded-xl' 
                  key={item._id}
                >
                  <div className='flex items-center gap-3 mb-3'>
                    {/* Avatar Circle */}
                    <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold'>
                      {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <p className='font-medium text-navy text-sm'>{displayName}</p>
                        {!item.isApproved && (
                          <span className='text-[10px] uppercase font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full'>
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-[#333]/50'>{Moment(item.createdAt).fromNow()}</p>
                    </div>
                    
                    {isOwner && (
                      <div className='ml-auto flex gap-1'>
                        {editingComment !== item._id ? (
                          <>
                            <button onClick={() => { setEditingComment(item._id); setEditContent(item.content) }} className='p-1.5 text-navy/60 hover:text-primary hover:bg-primary/10 rounded-md transition-colors'>
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => handleDeleteComment(item._id)} className='p-1.5 text-navy/60 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors'>
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {editingComment === item._id ? (
                    <div className='ml-11 bg-white p-2 rounded-xl border border-primary/30 shadow-inner'>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className='w-full p-2 outline-none resize-none text-navy text-sm'
                        rows={3}
                      />
                      <div className='flex justify-end gap-2 mt-2'>
                        <button onClick={() => setEditingComment(null)} className='flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-navy hover:bg-surface transition-colors'>
                          <X size={14} /> Cancel
                        </button>
                        <button onClick={() => handleEditComment(item._id)} className='flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors'>
                          <Check size={14} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className='text-sm text-[#333333] ml-11 leading-6'>{item.content}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Add Comment Section */}
        <div className='max-w-3xl mx-auto mb-16'>
          <h3 className='font-heading text-2xl font-bold text-navy mb-6'>
            Add your comment
          </h3>
          
          {isLoggedIn ? (
            <form className='flex flex-col items-start gap-4 max-w-lg' onSubmit={addComment}>
              <textarea 
                onChange={(e) => setContent(e.target.value)} 
                value={content} 
                className='w-full bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] p-4 text-base outline-none h-32 resize-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all border border-border' 
                required 
                placeholder='Write your comment...'
              ></textarea>
              <button 
                className='px-8 py-3 bg-primary text-white font-semibold text-base rounded-xl hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg' 
                type='submit'
              >
                Submit Comment
              </button>           
            </form>
          ) : (
            <div className='bg-surface-teal/50 border border-border rounded-xl p-6 text-center max-w-lg'>
              <p className='text-navy/70 mb-4'>You must be logged in to leave a comment.</p>
              <button 
                onClick={() => navigate('/login')}
                className='bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-md'
              >
                Log In to Comment
              </button>
            </div>
          )}
        </div>

        {/* Share Buttons */}
        <div className='max-w-3xl mx-auto pb-20'>
          <h3 className='font-heading text-xl font-bold text-navy mb-5'>
            Share this article
          </h3>
          <div className='flex gap-4'>
            <Share2 className='w-10 h-10 p-2 rounded-full bg-surface-teal border border-border text-navy/60 hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm' />
            <Link2 className='w-10 h-10 p-2 rounded-full bg-surface-teal border border-border text-navy/60 hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm' />
            <Globe className='w-10 h-10 p-2 rounded-full bg-surface-teal border border-border text-navy/60 hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm' />
          </div>
        </div>
      </div>

      <Footer/>

    </div>
  ) : <Loader/>  
}

export default Blog
