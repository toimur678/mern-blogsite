import React, { useEffect, useState } from 'react'
import { FileText, MessageCircle, FilePen, Clock } from 'lucide-react'
import BlogTableItem from '../../components/admin/BlogTableItem';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        blogs: 0,
        comments: 0,
        drafts: 0,
        recentBlogs: []
    })

    const {axios} = useAppContext()


    const fetchDashboard = async () => {
        try {
            const {data} = await axios.get('/api/admin/dashboard')         
            data.success ? setDashboardData(data.dashboardData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        fetchDashboard();
    }, []);
    
    
  return (
    <div className='flex-1 p-6 sm:p-10 bg-surface-input overflow-y-auto'>
      {/* Stats Cards */}
      <div className='flex flex-wrap gap-5'>
        
        <div className='flex items-center bg-surface gap-4 p-5 min-w-[220px] rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-card'>
            <div className='w-12 h-12 rounded-xl bg-surface-teal flex items-center justify-center'>
              <FileText className='w-6 h-6 text-primary' />
            </div>
            <div>
                <p className='text-2xl font-bold text-navy'>{dashboardData.blogs}</p>
                <p className='text-sm text-[#333]/60 font-medium'>Blogs</p>
            </div>
        </div>
        
        <div className='flex items-center bg-surface gap-4 p-5 min-w-[220px] rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-card'>
            <div className='w-12 h-12 rounded-xl bg-surface-teal flex items-center justify-center'>
              <MessageCircle className='w-6 h-6 text-primary' />
            </div>
            <div>
                <p className='text-2xl font-bold text-navy'>{dashboardData.comments}</p>
                <p className='text-sm text-[#333]/60 font-medium'>Comments</p>
            </div>
        </div>

        <div className='flex items-center bg-surface gap-4 p-5 min-w-[220px] rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all shadow-card'>
            <div className='w-12 h-12 rounded-xl bg-surface-teal flex items-center justify-center'>
              <FilePen className='w-6 h-6 text-primary' />
            </div>
            <div>
                <p className='text-2xl font-bold text-navy'>{dashboardData.drafts}</p>
                <p className='text-sm text-[#333]/60 font-medium'>Drafts</p>
            </div>
        </div>
      </div>

        {/* Recent Blogs Table */}
        <div className='mt-8'>
            <div className='flex items-center gap-3 mb-4'>
                <Clock className='w-5 h-5 text-primary' />
                <h3 className='font-heading text-lg font-bold text-navy'>Latest Blogs</h3>
            </div>

            <div className='relative max-w-5xl overflow-x-auto rounded-xl bg-surface shadow-card'>
                <table className='w-full text-sm text-[#333]'>
                    <thead className='text-xs text-navy/60 text-left uppercase border-b border-border'>
                        <tr>
                            <th scope='col' className='px-4 py-4 xl:px-6 font-semibold'> # </th>
                            <th scope='col' className='px-4 py-4 font-semibold'> Blog Title </th>
                            <th scope='col' className='px-4 py-4 max-sm:hidden font-semibold'> Date </th>
                            <th scope='col' className='px-4 py-4 max-sm:hidden font-semibold'> Status </th>
                            <th scope='col' className='px-4 py-4 font-semibold'> Actions </th>
                        </tr>
                    </thead>
                    <tbody>
                        {dashboardData.recentBlogs.map((blog, index) => {
                            return <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchDashboard} index={index + 1}/>
                        })}
                    </tbody>
                </table>
            </div>
        </div>        
        
    </div>
  )
}

export default Dashboard
