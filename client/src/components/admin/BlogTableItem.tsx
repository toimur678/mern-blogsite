import { X, Edit3 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { BlogData } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

interface BlogTableItemProps {
  blog: BlogData
  fetchBlogs: () => Promise<void>
  index: number
}

const BlogTableItem = ({blog, fetchBlogs, index}: BlogTableItemProps) => {
  const navigate = useNavigate();
  const { title, createdAt} = blog
  const BlogDate = new Date(createdAt)

  const {axios, userRole} = useAppContext()
  const deleteBlog = async () => {
    const confirm = window.confirm("Are you sure you want to delete this blog?")
    if(!confirm) return;
    try {
      const {data} = await axios.post('/api/blog/delete', {id: blog._id})
      if(data.success) {
        toast.success(data.message)
        await fetchBlogs() 
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const togglePublish = async () => {
    try {
      const {data} = await axios.post('/api/blog/toggle-publish', {id: blog._id})
      if(data.success) {
        toast.success(data.message)
        await fetchBlogs()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <tr className='border-b border-border hover:bg-surface-teal/10 transition-colors'>
        <th className='px-4 py-4 xl:px-6 text-navy font-medium'>{ index }</th>
        <td className='px-4 py-4 text-navy'>{ title }</td>
        <td className='px-4 py-4 max-sm:hidden text-[#333]/60'>{BlogDate.toDateString()}</td>
        <td className='px-4 py-4 max-sm:hidden'>
            <span className={`text-xs font-medium px-3 py-1 rounded-md ${
              blog.isPublished 
                ? 'bg-surface-teal text-primary' 
                : 'bg-accent/10 text-accent'
            }`}>
              {blog.isPublished ? 'Published': 'Draft'}
            </span>
        </td>

        <td className='px-4 py-4 flex items-center text-xs gap-3'>
            <button 
              onClick={togglePublish} 
              className='px-3 py-1.5 rounded-lg border border-border text-[#333] hover:border-primary hover:text-primary transition-colors cursor-pointer'
            >
              {blog.isPublished ? 'Unpublish': 'Publish'}
            </button>
            <button onClick={() => navigate('/admin/editBlog/' + blog._id)} className='p-1.5 rounded-lg hover:bg-surface-teal text-[#333]/60 hover:text-primary transition-all cursor-pointer'>
              <Edit3 className='w-5 h-5' />
            </button>
            {/* Only admin can delete blogs */}
            {userRole === 'admin' && (
              <button onClick={deleteBlog} className='p-1.5 rounded-lg hover:bg-red-50 text-[#333]/60 hover:text-red-500 transition-all cursor-pointer'>
                <X className='w-5 h-5' />
              </button>
            )}
        </td>
      
    </tr>
  )
}

export default BlogTableItem
