import React, { useState } from 'react'
import { blogCategories } from '../assets/assets'
import { motion } from 'motion/react'
import BlogCard from './BlogCard';
import { useAppContext } from '../context/AppContext';

const BlogList = () => {

  const [menu, setMenu] = useState("All");
  const {blogs, input} = useAppContext();

  const filteredBlogs = () => {
    if(input === '') {
      return blogs
    }
    return blogs.filter((blog) => blog.title.toLowerCase().includes(input.toLowerCase()) || blog.category.toLowerCase().includes(input.toLowerCase()))
  }

  return (
    <section className='max-w-[1280px] mx-auto px-8 sm:px-12 xl:px-0 py-16 sm:py-20'>
      {/* Section Title */}
      <h2 className='font-heading text-[28px] sm:text-[40px] font-[800] text-navy text-center mb-10 leading-[48px]'>
        Latest Blogs
      </h2>

      {/* Category Filter */}
      <div className='flex flex-wrap justify-center gap-3 sm:gap-4 mb-12'>
        {blogCategories.map((item) => (
          <div className='relative' key={item}>
            <button 
              onClick={() => setMenu(item)} 
              className={`relative px-6 py-2.5 text-base font-medium rounded-lg cursor-pointer transition-colors duration-200 z-10 ${
                menu === item 
                  ? 'text-white' 
                  : 'text-[#333] hover:text-primary'
              }`}
            >
              {item}
              {menu === item && (
                <motion.div 
                  layoutId='underline' 
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }} 
                  className='absolute inset-0 bg-primary rounded-lg -z-10'
                />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Blog Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        {filteredBlogs().filter((blog) => menu === "All" ? true : blog.category === menu).map((blog) => (
          <BlogCard key={blog._id} blog={blog}/>
        ))}
      </div>

      {/* Empty State */}
      {filteredBlogs().filter((blog) => menu === "All" ? true : blog.category === menu).length === 0 && (
        <div className='text-center py-20'>
          <p className='text-lg text-[#333] font-medium'>No blogs found</p>
          <p className='text-sm text-[#333]/60 mt-2'>Try a different category or search term</p>
        </div>
      )}
    </section>
  )
}

export default BlogList
