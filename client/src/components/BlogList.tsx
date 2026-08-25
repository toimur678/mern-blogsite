import { useState } from 'react'
import { blogCategories } from '../assets/assets'
import { motion } from 'motion/react'
import BlogCard from './BlogCard';
import { useAppContext } from '../context/AppContext';

const BlogList = () => {

  const [menu, setMenu] = useState<string>("All");
  const {blogs, input} = useAppContext();

  const filteredBlogs = () => {
    if(input === '') {
      return blogs
    }
    return blogs.filter((blog) => blog.title.toLowerCase().includes(input.toLowerCase()) || blog.category.toLowerCase().includes(input.toLowerCase()))
  }

  const displayedBlogs = filteredBlogs().filter((blog) => menu === "All" ? true : blog.category === menu)

  return (
    <section className='max-w-[1280px] mx-auto px-6 sm:px-12 xl:px-0 py-16 sm:py-24'>
      {/* Section Title */}
      <div className='text-center mb-16'>
        <h2 className='font-heading text-4xl sm:text-5xl font-extrabold text-navy mb-4'>
          Latest & Greatest
        </h2>
        <p className='text-lg text-navy/60 max-w-2xl mx-auto'>
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
      </div>

      {/* Category Filter - Glassmorphism Pill */}
      <div className='flex justify-center mb-16'>
        <div className='inline-flex flex-wrap justify-center p-2 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-sm'>
          {blogCategories.map((item) => (
            <div className='relative' key={item}>
              <button 
                onClick={() => setMenu(item)} 
                className={`relative px-6 py-2.5 text-sm sm:text-base font-medium rounded-xl cursor-pointer transition-colors duration-300 z-10 ${
                  menu === item 
                    ? 'text-white' 
                    : 'text-navy/70 hover:text-primary'
                }`}
              >
                {item}
                {menu === item && (
                  <motion.div 
                    layoutId='underline' 
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }} 
                    className='absolute inset-0 bg-primary shadow-lg rounded-xl -z-10'
                  />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Asymmetric Bento-Box Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
        {displayedBlogs.map((blog, index) => {
          // The first item spans 2 columns and 2 rows to create the bento-box featured look
          const isFeatured = index === 0;
          return <BlogCard key={blog._id} blog={blog} featured={isFeatured} />
        })}
      </div>

      {/* Empty State */}
      {displayedBlogs.length === 0 && (
        <div className='text-center py-20 bg-white/20 backdrop-blur-md rounded-[32px] border border-white/30 mt-10'>
          <div className='w-20 h-20 mx-auto bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm'>
            <span className='text-3xl'>📭</span>
          </div>
          <p className='text-xl text-navy font-bold'>No stories found</p>
          <p className='text-base text-navy/60 mt-3'>Try adjusting your search or category filter</p>
        </div>
      )}
    </section>
  )
}

export default BlogList
