import { useNavigate } from 'react-router-dom'
import Moment from 'moment'
import { BlogData } from '../assets/assets'

interface BlogCardProps {
  blog: BlogData
}

const BlogCard = ({blog}: BlogCardProps) => {

  const {title, description, category, image, _id, createdAt} = blog;
  const navigate = useNavigate();

  // Estimate reading time (avg 200 words/min)
  const plainText = description ? description.replace(/<[^>]*>/g, '') : '';
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div 
      onClick={() => navigate(`/blog/${_id}`)} 
      className='bg-surface rounded-[20px] overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1 shadow-card hover:shadow-card-hover'
    >
      {/* Image */}
      <div className='overflow-hidden rounded-[20px]'>
        <img 
          className='w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105' 
          src={image} 
          alt={title} 
        />
      </div>

      {/* Content */}
      <div className='p-7'>
        {/* Meta Row */}
        <div className='flex items-center gap-3 mb-4'>
          <span className='bg-surface-teal text-primary text-xs font-medium uppercase px-4 py-2 rounded-md tracking-wide leading-[14.4px]'>
            {createdAt ? Moment(createdAt).format('MMM DD, YYYY') : 'Draft'}
          </span>
          <span className='text-xs text-[#333] font-normal'>
            {readTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className='font-heading text-2xl font-bold text-navy leading-8 mb-3 line-clamp-2'>
          {title}
        </h3>

        {/* Description */}
        <p className='text-base text-[#333333] leading-6 mb-4 line-clamp-2' dangerouslySetInnerHTML={{"__html": description.slice(0, 120)}}></p>

        {/* Read More */}
        <span className='text-primary text-base font-semibold italic cursor-pointer group-hover:text-primary-dark transition-colors'>
          Read More <span className='not-italic'>›</span>
        </span>
      </div>
    </div>
  )
}

export default BlogCard
