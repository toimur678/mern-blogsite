import {toast} from 'react-hot-toast'
import { Check, Trash2 } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { CommentData } from '../../assets/assets'

interface CommentTableItemProps {
  comment: CommentData
  fetchComments: () => Promise<void>
  index: number
}

const CommentTableItem = ({comment, fetchComments}: CommentTableItemProps) => {
  
  const {blog, createdAt, _id} = comment
  const BlogDate = new Date(createdAt)

  const {axios, userRole} = useAppContext()
  const approveComment = async () => {
    try {
      const {data} = await axios.post('/api/admin/approve-comment', {id: _id})
      if(data.success) {
        toast.success(data.message)
        fetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const deleteComment = async () => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this comment?")
      if(!confirm) return;
      const {data} = await axios.post('/api/admin/delete-comment', {id: _id})
      if(data.success) {
        toast.success(data.message)
        fetchComments()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <tr className='border-b border-border hover:bg-surface-teal/10 transition-colors'>
      <td className='px-6 py-5'>
        <div className='space-y-1.5'>
          <p className='text-xs text-navy/50 font-medium uppercase tracking-wide'>Blog</p>
          <p className='text-sm text-navy font-medium'>{blog.title}</p>
          <p className='text-xs text-navy/50 font-medium uppercase tracking-wide mt-3'>Comment by {comment.name}</p>
          <p className='text-sm text-[#333]'>{comment.content}</p>
        </div>
      </td>

      <td className='px-6 py-5 max-sm:hidden text-[#333]/60 text-sm'>
        {BlogDate.toLocaleDateString()}
      </td>

      <td className='px-6 py-5'>
        <div className='inline-flex items-center gap-4'>
            {/* Only admin can approve/delete comments */}
            {userRole === 'admin' ? (
              <>
                {!comment.isApproved ? (
                  <button onClick={approveComment} className='p-1.5 rounded-lg hover:bg-surface-teal text-primary/60 hover:text-primary transition-all cursor-pointer'>
                    <Check className='w-5 h-5' />
                  </button>
                ) : (
                  <span className='text-xs bg-surface-teal text-primary font-medium rounded-md px-3 py-1.5'>Approved</span> 
                )}
                <button onClick={deleteComment} className='p-1.5 rounded-lg hover:bg-red-50 text-[#333]/60 hover:text-red-500 transition-all cursor-pointer'>
                  <Trash2 className='w-4 h-4' />
                </button>
              </>
            ) : (
              <span className={`text-xs font-medium rounded-md px-3 py-1.5 ${
                comment.isApproved 
                  ? 'bg-surface-teal text-primary' 
                  : 'bg-accent/10 text-accent'
              }`}>
                {comment.isApproved ? 'Approved' : 'Pending'}
              </span>
            )}
        </div>
      </td>
    </tr>
  )
}

export default CommentTableItem
