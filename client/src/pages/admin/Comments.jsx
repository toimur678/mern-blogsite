import React, { useEffect, useState } from 'react'
import CommentTableItem from '../../components/admin/CommentTableItem';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Comments = () => {

  const [comments, setComments] = useState([]);  
  const [filter, setFilter] = useState('Not Approved');

  const {axios} = useAppContext()

  const fetchComments = async () => {
    try {
      const {data} = await axios.get('/api/admin/comments')
      data.success ? setComments(data.comments) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchComments();
  }, [])
  
  return (
    <div className='flex-1 p-6 sm:p-10 bg-surface-input overflow-y-auto'>
      <div className='flex justify-between items-center max-w-5xl mb-6'>
        <h2 className='font-heading text-2xl font-bold text-navy'>Comments</h2>
        <div className='flex gap-3'>
          <button 
            onClick={() => setFilter("Approved")} 
            className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
              filter === 'Approved' 
                ? 'bg-primary text-white' 
                : 'bg-surface-teal text-primary hover:bg-primary/10'
            }`}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter("Not Approved")} 
            className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
              filter === 'Not Approved' 
                ? 'bg-primary text-white' 
                : 'bg-surface-teal text-primary hover:bg-primary/10'
            }`}
          >
            Not Approved
          </button>
        </div>
      </div>

      <div className='relative max-w-5xl overflow-x-auto rounded-xl bg-surface shadow-card'>
        <table className='w-full text-sm text-[#333]'>
          <thead className='text-xs text-navy/60 text-left uppercase border-b border-border'>
            <tr>
              <th scope='col' className='px-6 py-4 font-semibold'>Blog Title & Comment</th>
              <th scope='col' className='px-6 py-4 max-sm:hidden font-semibold'> Date </th>
              <th scope='col' className='px-6 py-4 font-semibold'> Actions </th>
            </tr>
          </thead>

          <tbody>
            {comments.filter((comment) => {
              if(filter === "Approved") return comment.isApproved === true;
              return comment.isApproved === false;
            }).map((comment, index) => <CommentTableItem key={comment._id} comment={comment} index={index + 1} fetchComments={fetchComments}/>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Comments
