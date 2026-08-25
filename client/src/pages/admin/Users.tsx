import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import Moment from 'moment'

interface CommentData {
  _id: string
  content: string
  createdAt: string
}

interface UserData {
  _id: string
  name: string
  email: string
  createdAt: string
  comments: CommentData[]
}

const Users = () => {
  const { axios } = useAppContext()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/admin/users')
      if (data.success) {
        setUsers(data.users)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className='flex-1 p-6 sm:p-10 flex items-center justify-center bg-surface-input'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='flex-1 p-6 sm:p-10 bg-surface-input text-navy overflow-y-auto'>
      <div className='bg-surface w-full max-w-5xl p-8 rounded-xl shadow-card'>
        <h2 className='font-heading text-2xl font-bold text-navy mb-6'>Users ({users.length})</h2>

        {users.length === 0 ? (
          <p className='text-navy/60'>No users found.</p>
        ) : (
          <div className='space-y-6'>
            {users.map(user => (
              <div key={user._id} className='border border-border rounded-xl p-5'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h3 className='text-lg font-bold text-navy'>{user.name}</h3>
                    <p className='text-sm text-navy/60'>{user.email}</p>
                  </div>
                  <div className='text-right'>
                    <p className='text-xs text-navy/50'>Joined on</p>
                    <p className='text-sm text-navy font-medium'>{Moment(user.createdAt).format('MMMM Do, YYYY')}</p>
                  </div>
                </div>

                <div className='bg-surface-teal/30 p-4 rounded-lg'>
                  <p className='text-sm font-medium text-navy mb-3'>
                    Comments ({user.comments.length})
                  </p>
                  {user.comments.length === 0 ? (
                    <p className='text-sm text-navy/50 italic'>No comments yet.</p>
                  ) : (
                    <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar'>
                      {user.comments.map(comment => (
                        <div key={comment._id} className='bg-white p-3 rounded border border-border/50 text-sm'>
                          <p className='text-navy mb-1'>{comment.content}</p>
                          <p className='text-xs text-navy/40'>{Moment(comment.createdAt).fromNow()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Users
