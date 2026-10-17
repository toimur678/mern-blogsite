import { ArrowRight, Bookmark, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { authorName, formatDate, readingTime } from '../lib/format'

const Header = () => {
  const { blogs, blogsLoading, savedIds, toggleSaved, demoMode } = useAppContext()
  const primary = blogs.find(blog => blog.featured) || blogs[0]
  const rest = blogs.filter(blog => blog._id !== primary?._id)
  const showcase = primary ? (rest.length >= 2 ? [rest[0], primary, rest[1]] : [primary, ...rest.slice(0, 2)]) : []

  return <section className='site-container journal-header'>
    <div className='journal-intro'>
      <p className='eyebrow'><span className='status-dot'/> AN INDEPENDENT JOURNAL{demoMode && <span className='sample-label'>SAMPLE EDITION</span>}</p>
      <h1>Explore the world’s<br/><em>most considered stories</em></h1>
    </div>
    {blogsLoading ? <div className='hero-showcase hero-showcase-loading' aria-label='Loading featured stories'>
      <div className='feature-skeleton skeleton'/>
      <div className='feature-skeleton skeleton'/>
      <div className='feature-skeleton skeleton'/>
    </div> : showcase.length > 0 && <div className={`hero-showcase ${showcase.length < 3 ? 'hero-showcase-compact' : ''}`}>
      {showcase.map(story => {
        const isPrimary = story._id === primary?._id
        const saved = savedIds.includes(story._id)
        return <article key={story._id} className={`hero-card ${isPrimary ? 'hero-card-center' : ''}`}>
          <div className='hero-card-media'>
            <Link to={`/blog/${story._id}`} className='hero-image-link'>
              <img className='hero-image' src={story.image} alt={story.title} fetchPriority={isPrimary ? 'high' : 'auto'} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/images/quiet-spaces.jpg' }}/>
            </Link>
            <Link to={`/?category=${encodeURIComponent(story.category)}#stories`} className='card-category-pill'>{story.category}</Link>
            <span className='card-floating-meta'><Compass size={12}/> {isPrimary ? 'Editor’s pick' : authorName(story)}</span>
          </div>
          <div className='hero-card-body'>
            <div className='story-meta'>
              <span>{formatDate(story.publishedAt || story.createdAt)}</span>
              <span className='meta-dot'>•</span>
              <span>{readingTime(story)} min read</span>
            </div>
            <Link to={`/blog/${story._id}`} className='hero-card-title'><h2>{story.title}</h2></Link>
            <div className='hero-card-footer'>
              <Link className={`button ${isPrimary ? 'button-dark' : 'button-outline'} button-read`} to={`/blog/${story._id}`}>Read more <ArrowRight size={14}/></Link>
              <button className={`icon-button bookmark-button ${saved ? 'is-saved' : ''}`} onClick={() => toggleSaved(story._id)} aria-label={saved ? `Unsave ${story.title}` : `Save ${story.title}`} aria-pressed={saved}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'}/></button>
            </div>
          </div>
        </article>
      })}
    </div>}
  </section>
}
export default Header

