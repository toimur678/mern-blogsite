import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link2, Share2, Globe } from 'lucide-react'
import Navbar from '../components/Navbar';
import Moment from 'moment'
import Footer from '../components/Footer'
import Loader from '../components/Loader';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Blog = () => {

  const {id} = useParams()

  const {axios} = useAppContext()

  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const fetchBlogData = async () => {
    try {
      const {data} = await axios.get(`/api/blog/${id}`)
      data.success ? setData(data.blog) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchComments = async () => {
    try {
      const {data} = await axios.post('/api/blog/comments', {blogId: id})
      console.log(data.comments)
      if(data.success) {
        setComments(data.comments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const addComment = async (e) => {
    e.preventDefault();
    try {
      const {data} = await axios.post('/api/blog/add-comment', {blog: id, name, content})
      if(data.success) {
        toast.success(data.message)
        setName('')
        setContent('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }

  }

  useEffect(() => {
    fetchBlogData();
    fetchComments();
  }, [])

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

        {/* Author Badge */}
        <span className='inline-block bg-surface-teal text-primary text-sm font-medium px-5 py-2 rounded-full'>
          Michael Brown
        </span>
      </div>

      {/* Content */}
      <div className='max-w-5xl mx-auto px-5 sm:px-8'>
        {/* Featured Image */}
        <img className='w-full rounded-[20px] mb-10' src={data.image} alt={data.title} />

        {/* Rich Text Content */}
        <div className='rich-text max-w-3xl mx-auto'>
          <div dangerouslySetInnerHTML={{__html: data.description}}></div>
        </div>

        {/* Comment Section */}
        <div className='mt-16 mb-10 max-w-3xl mx-auto'>
          <h3 className='font-heading text-2xl font-bold text-navy mb-6'>
            Comments ({comments.length})
          </h3>
          <div className='flex flex-col gap-4'>
            {comments.map((item, index) => (
              <div 
                className='bg-surface-teal/30 border border-border-teal p-5 rounded-xl max-w-xl' 
                key={index}
              >
                <div className='flex items-center gap-3 mb-3'>
                  {/* Avatar Circle */}
                  <div className='w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold'>
                    {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <p className='font-medium text-navy'>{item.name}</p>
                  <span className='text-xs text-[#333]/50 ml-auto'>{Moment(item.createdAt).fromNow()}</span>
                </div>
                <p className='text-sm text-[#333333] ml-11 leading-6'>{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Add Comment Section */}
        <div className='max-w-3xl mx-auto mb-16'>
          <h3 className='font-heading text-2xl font-bold text-navy mb-6'>
            Add your comment
          </h3>
          <form className='flex flex-col items-start gap-4 max-w-lg' onSubmit={addComment}>
            <input 
              onChange={(e) => setName(e.target.value)} 
              value={name} 
              className='w-full h-[44px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-4 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
              type="text" 
              placeholder='Name' 
              required 
            />
            <textarea 
              onChange={(e) => setContent(e.target.value)} 
              value={content} 
              className='w-full bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] p-4 text-base outline-none h-40 resize-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
              required 
              placeholder='Write your comment...'
            ></textarea>
            <button 
              className='px-8 py-4 bg-primary text-white font-semibold text-base rounded-lg hover:bg-primary-dark transition-colors cursor-pointer' 
              type='submit'
            >
              Submit Comment
            </button>           
          </form>
        </div>

        {/* Share Buttons */}
        <div className='max-w-3xl mx-auto pb-20'>
          <h3 className='font-heading text-xl font-bold text-navy mb-5'>
            Share this article
          </h3>
          <div className='flex gap-4'>
            <Share2 className='w-7 h-7 text-[#333]/60 hover:text-primary transition-colors cursor-pointer' />
            <Link2 className='w-7 h-7 text-[#333]/60 hover:text-primary transition-colors cursor-pointer' />
            <Globe className='w-7 h-7 text-[#333]/60 hover:text-primary transition-colors cursor-pointer' />
          </div>
        </div>
      </div>

      <Footer/>

    </div>
  ) : <Loader/>  
}

export default Blog
