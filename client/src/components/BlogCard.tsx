import { Link } from 'react-router-dom'
import { Bookmark, ArrowRight } from 'lucide-react'
import { type BlogData, extractTextFromBlocks } from '../assets/assets'
import { authorName, formatDate, readingTime } from '../lib/format'
import { useAppContext } from '../context/AppContext'

const BlogCard = ({ blog, featured = false }: { blog: BlogData; featured?: boolean }) => {
  const { savedIds, toggleSaved } = useAppContext()
  const saved = savedIds.includes(blog._id)
  // Extract plain text from Editor.js blocks for preview
  const plainText = blog.excerpt || blog.subTitle || extractTextFromBlocks(blog.description)
  return <article className={`story-card ${featured ? 'story-card-featured' : ''}`}>
    {/* Image + Floating Category Badge */}
    <div className='story-media'>
      <Link to={`/blog/${blog._id}`} className='story-image-link' tabIndex={-1} aria-hidden='true'>
        <img src={blog.image} alt='' loading='lazy' onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/quiet-spaces.jpg' }}/>
      </Link>
      <Link className='card-category-pill' to={`/?category=${encodeURIComponent(blog.category)}#stories`}>{blog.category}</Link>
    </div>
    {/* Content */}
    <div className='story-card-content'>
      {/* Meta Row */}
      <div className='story-meta'>
        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
        <span className='meta-dot'>•</span>
        <span>{readingTime(blog)} min read</span>
      </div>
      {/* Title */}
      <h3><Link to={`/blog/${blog._id}`}>{blog.title}</Link></h3>
      {/* Description Preview (plain text, no HTML) */}
      <p className='story-excerpt'>{plainText}</p>
      {/* Read More + Author & Bookmark */}
      <div className='story-card-bottom'>
        <Link className='button button-outline button-read' to={`/blog/${blog._id}`}>Read more <ArrowRight size={14}/></Link>
        <div className='story-card-meta-right'>
          <span className='story-byline'>{authorName(blog)}</span>
          <button className={`icon-button bookmark-button ${saved ? 'is-saved' : ''}`} onClick={() => toggleSaved(blog._id)} aria-label={`${saved ? 'Unsave' : 'Save'} ${blog.title}`} aria-pressed={saved}><Bookmark size={16} fill={saved ? 'currentColor' : 'none'}/></button>
        </div>
      </div>
    </div>
  </article>
}
export default BlogCard

