import { useNavigate } from 'react-router-dom'
import Moment from 'moment'
import { BlogData, extractTextFromBlocks } from '../assets/assets'

interface BlogCardProps {
  blog: BlogData
  featured?: boolean
}

const BlogCard = ({blog, featured = false}: BlogCardProps) => {

  const {title, description, image, _id, createdAt} = blog;
  const navigate = useNavigate();

  // Extract plain text from Editor.js blocks for preview
  const plainText = extractTextFromBlocks(description)
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div 
      onClick={() => navigate(`/blog/${_id}`)} 
      className={`relative overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 shadow-card hover:shadow-card-hover rounded-[24px] 
        bg-white/40 backdrop-blur-lg border border-white/30 
        ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      {/* Image */}
      <div className={`overflow-hidden ${featured ? 'aspect-[16/9] md:aspect-auto md:h-[320px]' : 'aspect-video'}`}>
        <img 
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105' 
          src={image} 
          alt={title} 
        />
      </div>

      {/* Content */}
      <div className={`p-6 sm:p-8 ${featured ? 'md:p-10' : ''}`}>
        {/* Meta Row */}
        <div className='flex items-center gap-3 mb-4'>
          <span className='bg-white/60 backdrop-blur-md border border-white/50 text-primary text-xs font-medium uppercase px-4 py-2 rounded-full tracking-wide'>
            {createdAt ? Moment(createdAt).format('MMM DD, YYYY') : 'Draft'}
          </span>
          <span className='text-xs text-[#333]/80 font-medium'>
            {readTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-heading font-bold text-navy mb-3 line-clamp-2 transition-colors group-hover:text-primary 
          ${featured ? 'text-2xl md:text-3xl lg:text-[40px] leading-tight mb-4' : 'text-2xl leading-8'}`}>
          {title}
        </h3>

        {/* Description Preview (plain text, no HTML) */}
        <p className={`text-[#333333]/80 leading-relaxed mb-6 line-clamp-2
          ${featured ? 'text-lg md:text-xl' : 'text-base'}`}>
          {plainText.slice(0, featured ? 180 : 120)}...
        </p>

        {/* Read More */}
        <span className='inline-flex items-center gap-2 text-primary font-semibold transition-colors group-hover:text-primary-dark'>
          Read More 
          <span className='text-xl leading-none transition-transform group-hover:translate-x-1'>›</span>
        </span>
      </div>
      
      {/* Subtle Glow Effect */}
      <div className='absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500' />
    </div>
  )
}

export default BlogCard
