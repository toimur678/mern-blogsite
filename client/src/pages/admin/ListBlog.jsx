import React, { useEffect, useState } from 'react'
import BlogTableItem from '../../components/admin/BlogTableItem';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListBlog = () => {

  const [blogs, setBlogs] = useState([]);
  const {axios} = useAppContext()

  const fetchBlogs = async () => {
    try {
      const {data} = await axios.get('/api/admin/blogs')
      if(data.success) {
        setBlogs(data.blogs)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);


  return (
    <div className='flex-1 p-6 sm:p-10 bg-surface-input overflow-y-auto'>
      <h2 className='font-heading text-2xl font-bold text-navy mb-5'>All Blogs</h2>
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
              {blogs.map((blog, index) => {
                  return <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchBlogs} index={index + 1}/>
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListBlog
