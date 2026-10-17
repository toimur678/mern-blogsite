import { Bookmark, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import Loader from '../components/Loader'

const Saved = () => {
  const { blogs, savedIds, blogsLoading, blogsError, refreshBlogs } = useAppContext()
  const stories = blogs.filter(story => savedIds.includes(story._id))
  return <><Navbar/><main id='main-content' className='site-container static-page'><div className='saved-heading'><div><p className='eyebrow'>YOUR PERSONAL COLLECTION</p><h1>A read for later.</h1><p>Good stories are worth keeping close.</p></div><span className='eyebrow'>{stories.length} SAVED {stories.length === 1 ? 'STORY' : 'STORIES'}</span></div>{blogsLoading ? <Loader/> : blogsError ? <div className='empty-state' role='alert'><h3>Your reading list is taking a moment.</h3><p>{blogsError}</p><button className='button button-dark' onClick={() => void refreshBlogs()}>Try again</button></div> : stories.length ? <div className='story-grid'>{stories.map(story => <BlogCard key={story._id} blog={story}/>)}</div> : <div className='empty-state'><Bookmark size={30}/><h3>Make a little reading room.</h3><p>Tap the bookmark on any story. It will be waiting here when you have a moment.</p><Link className='button button-dark' to='/'>Find your next read <ArrowRight size={16}/></Link></div>}<p className='saved-note'>Your reading list is saved in this browser on this device.</p></main><Footer/></>
}
export default Saved
