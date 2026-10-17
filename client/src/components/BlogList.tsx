import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowRight, Search, X, LayoutGrid, List, BookOpen } from 'lucide-react'
import { blogCategories, extractTextFromBlocks, type BlogData } from '../assets/assets'
import { errorMessage } from '../lib/format'
import BlogCard from './BlogCard'
import { useAppContext } from '../context/AppContext'

const PAGE_SIZE = 6
const CATEGORY_IMAGES: Record<string, string> = {
  All: '/images/quiet-spaces.jpg',
  Design: '/images/design.jpg',
  Technology: '/images/technology.jpg',
  Culture: '/images/objects.jpg',
  Lifestyle: '/images/coast.jpg',
  Startup: '/images/workspace.jpg',
  Finance: '/images/mountains.jpg',
}

const BlogList = () => {
  const { axios, blogs, setBlogs, input, setInput, blogsLoading, blogsError, refreshBlogs, demoMode } = useAppContext()
  const [params, setParams] = useSearchParams()
  const paramsRef = useRef(params)
  const category = params.get('category') || 'All'
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [remoteStories, setRemoteStories] = useState<BlogData[]>([])
  const [remoteTotal, setRemoteTotal] = useState(0)
  const [remoteLoading, setRemoteLoading] = useState(true)
  const [remoteError, setRemoteError] = useState('')
  const [query, setQuery] = useState(input)
  const [retry, setRetry] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)
  const categories = [...new Set([...blogCategories, ...blogs.map(blog => blog.category)])]
  const search = params.get('q') || ''

  useEffect(() => { paramsRef.current = params }, [params])
  useEffect(() => { setInput(search) }, [search, setInput])
  useEffect(() => { setVisible(PAGE_SIZE) }, [category, input, sort])
  useEffect(() => { const timer = window.setTimeout(() => setQuery(input), 250); return () => window.clearTimeout(timer) }, [input])
  useEffect(() => {
    if (blogsLoading || demoMode) return
    const controller = new AbortController()
    setRemoteLoading(true)
    setRemoteError('')
    axios.get('/api/blog/all', { signal: controller.signal, params: { limit: PAGE_SIZE, page: Math.ceil(visible / PAGE_SIZE), search: query || undefined, category: category === 'All' ? undefined : category, sort: sort === 'newest' ? 'latest' : sort } }).then(({ data }) => {
      if (!data.success) throw new Error(data.message || 'Stories are unavailable.')
      if (!controller.signal.aborted) {
        setRemoteStories(previous => visible <= PAGE_SIZE ? data.blogs : [...previous, ...data.blogs.filter((story: BlogData) => !previous.some(item => item._id === story._id))])
        setRemoteTotal(data.pagination?.total ?? data.blogs.length)
        setBlogs(previous => [...previous, ...data.blogs.filter((story: BlogData) => !previous.some(item => item._id === story._id))])
      }
    }).catch(error => { if (!controller.signal.aborted) setRemoteError(errorMessage(error)) }).finally(() => { if (!controller.signal.aborted) setRemoteLoading(false) })
    return () => controller.abort()
  }, [axios, blogsLoading, demoMode, query, category, sort, visible, retry, setBlogs])
  useEffect(() => { if (params.get('search') === 'open') searchRef.current?.focus({ preventScroll: true }) }, [params])

  const updateParams = (key: string, value: string) => {
    const next = new URLSearchParams(paramsRef.current)
    if (value && value !== 'All') next.set(key, value)
    else next.delete(key)
    next.delete('search')
    paramsRef.current = next
    setParams(next, { preventScrollReset: true })
  }
  const filtered = blogs.filter(blog => (category === 'All' || category === blog.category) && `${blog.title} ${blog.subTitle || ''} ${blog.category} ${blog.authorName || ''} ${extractTextFromBlocks(blog.description)}`.toLowerCase().includes(input.toLowerCase()))
    .sort((a, b) => sort === 'popular' ? (b.likes?.length || 0) - (a.likes?.length || 0) : sort === 'oldest' ? Date.parse(a.createdAt) - Date.parse(b.createdAt) : Date.parse(b.createdAt) - Date.parse(a.createdAt))
  const localStories = category === 'All' && !input && sort === 'newest' && filtered.length > 1 ? filtered.filter(blog => !blog.featured) : filtered
  const displayed = demoMode ? localStories : remoteStories
  const total = demoMode ? displayed.length : remoteTotal
  const loading = blogsLoading || (!demoMode && remoteLoading && visible <= PAGE_SIZE)
  const failure = blogsError || (!demoMode ? remoteError : '')
  const retryLoad = () => { if (blogsError) void refreshBlogs(); else setRetry(value => value + 1) }

  return <>
    {/* Visual Blog Categories Grid */}
    <section className='site-container categories-section' id='categories' aria-labelledby='categories-heading'>
      <div className='categories-heading'>
        <p className='eyebrow'>EXPLORE BY TOPIC</p>
        <h2 id='categories-heading'>Blog categories</h2>
      </div>
      <div className='category-tile-grid' role='group' aria-label='Blog categories'>
        {categories.map(topic => {
          const isSelected = category === topic
          const bgImage = CATEGORY_IMAGES[topic] || '/images/design.jpg'
          const count = topic === 'All' ? blogs.length : blogs.filter(blog => blog.category === topic).length
          return <button
            key={topic}
            type='button'
            onClick={() => {
              updateParams('category', topic)
              document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={`category-tile ${isSelected ? 'is-selected' : ''}`}
            aria-pressed={isSelected}
          >
            <img src={bgImage} alt='' className='category-tile-bg' loading='lazy'/>
            <span className='category-tile-scrim' aria-hidden='true'/>
            <span className='category-tile-label'>{topic === 'All' ? 'All stories' : topic}</span>
            {blogs.length > 0 && <span className='category-tile-count'>{count}</span>}
          </button>
        })}
      </div>
    </section>

    {/* Fresh Off The Press Archive */}
    <section className='site-container latest-section' id='stories'>
      <div className='section-heading'>
        <div>
          <p className='eyebrow'>THE ARCHIVE</p>
          <h2>Fresh off the press</h2>
        </div>
        <div className='section-heading-actions'>
          {(category !== 'All' || input) ? <button type='button' className='button button-outline button-read' onClick={() => { setInput(''); setParams({}, { preventScrollReset: true }) }}>View all <ArrowRight size={14}/></button> : <span className='section-caption'>For the curious, the thoughtful, and the always learning.</span>}
        </div>
      </div>
      {/* Category Filter & Search Toolbar */}
      <div className='story-toolbar'>
        <div className='topic-tabs' aria-label='Filter by topic'>{categories.map(topic => <button key={topic} onClick={() => updateParams('category', topic)} className={`topic-tab ${category === topic ? 'selected' : ''}`} aria-pressed={category === topic}>{topic === 'All' ? 'All stories' : topic}</button>)}</div>
        <label className='story-search'><Search size={16}/><span className='sr-only'>Search stories</span><input ref={searchRef} type='search' aria-label='Search stories' maxLength={120} value={input} onChange={event => { setInput(event.target.value); updateParams('q', event.target.value) }} placeholder='Find a story…' enterKeyHint='search'/>{input && <button aria-label='Clear search' className='icon-button' onClick={() => { setInput(''); updateParams('q', '') }}><X size={14}/></button>}</label>
      </div>
      <div className='story-list-info'><span aria-live='polite'>{loading ? 'Finding your next read…' : input ? `${total} ${total === 1 ? 'story' : 'stories'} for “${input}”` : `${total} stories to explore`}</span><div className='story-display-controls'><label>Sort by <select aria-label='Sort stories' value={sort} onChange={event => setSort(event.target.value)}><option value='newest'>Newest first</option><option value='oldest'>Oldest first</option><option value='popular'>Most loved</option></select></label><span className='controls-divider'/><button className={`icon-button ${view === 'grid' ? 'control-selected' : ''}`} aria-label='Grid view' aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={16}/></button><button className={`icon-button ${view === 'list' ? 'control-selected' : ''}`} aria-label='List view' aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={18}/></button></div></div>
      {/* Story Grid */}
      {loading ? <div className='story-grid'>{[1, 2, 3].map(item => <div className='story-skeleton' key={item}><div className='skeleton'/><span className='skeleton'/><span className='skeleton'/></div>)}</div> : failure ? <div className='empty-state' role='alert'><BookOpen size={30}/><h3>Stories are taking a moment.</h3><p>{failure}</p><button className='button button-dark' onClick={retryLoad}>Try again <ArrowRight size={16}/></button></div> : <div className={`story-grid ${view === 'list' ? 'story-grid-list' : ''}`}>{displayed.slice(0, visible).map(blog => <BlogCard key={blog._id} blog={blog}/>)}</div>}
      {/* Empty State */}
      {!loading && !failure && displayed.length === 0 && <div className='empty-state'><Search size={28}/><h3>A different perspective awaits.</h3><p>{input || category !== 'All' ? 'Try another search or explore all stories.' : 'The first stories are on their way. Come back soon.'}</p>{(input || category !== 'All') && <button className='button button-outline' onClick={() => { setInput(''); setParams({}) }}>Explore all stories <ArrowRight size={16}/></button>}</div>}
      {total > visible && <div className='load-more'><button className='button button-outline' disabled={!demoMode && remoteLoading} onClick={() => setVisible(value => value + PAGE_SIZE)}>{!demoMode && remoteLoading ? 'Finding more stories…' : 'More stories, more perspective'} <ArrowDown size={16}/></button><span>Showing {Math.min(visible, total)} of {total}</span></div>}
    </section>
  </>
}
export default BlogList

