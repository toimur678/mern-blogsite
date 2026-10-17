import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import BlogTableItem from '../../components/admin/BlogTableItem'
import { CmsEmpty, CmsError, CmsLoading, CmsPageHeading, CmsPagination } from '../../components/admin/CmsUI'
import { useAppContext } from '../../context/AppContext'
import { blogCategories, type BlogData } from '../../assets/assets'
import { errorMessage } from '../../lib/format'

const ListBlog = () => {
  const { axios } = useAppContext()
  const [blogs, setBlogs] = useState<BlogData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const requestVersion = useRef(0)
  const fetchBlogs = useCallback(async () => {
    const version = ++requestVersion.current
    setError(''); setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/blogs', { params: { page, limit: 8, search, status: status === 'all' ? undefined : status, category: category === 'All' ? undefined : category } })
      if (version !== requestVersion.current) return
      if (!data.success) throw new Error(data.message)
      setBlogs(data.blogs || []); setTotal(data.pagination?.total ?? data.blogs.length)
      if (data.pagination?.pages && page > data.pagination.pages) setPage(data.pagination.pages)
    } catch (err) { if (version === requestVersion.current) setError(errorMessage(err)) } finally { if (version === requestVersion.current) setLoading(false) }
  }, [axios, page, search, status, category])
  useEffect(() => { void fetchBlogs(); return () => { requestVersion.current += 1 } }, [fetchBlogs])
  useEffect(() => { const timer = window.setTimeout(() => { setSearch(query); setPage(1) }, 250); return () => window.clearTimeout(timer) }, [query])
  return <section className="cms-page">
    <CmsPageHeading title="Your stories, in one place." description="From first thought to final draft. Make every article count."><Link className="cms-button cms-button-primary" to="/admin/addBlog"><Plus size={16} />New article</Link></CmsPageHeading>
    <div className="cms-list-panel">
      <div className="cms-list-tabs" role="group" aria-label="Filter articles by status">{[['all', 'All articles'], ['published', 'Published'], ['draft', 'Drafts']].map(([key, label]) => <button key={key} aria-pressed={status === key} className={status === key ? 'cms-tab cms-tab-active' : 'cms-tab'} onClick={() => { setStatus(key); setPage(1) }}>{label}</button>)}</div>
      <div className="cms-list-toolbar"><label className="cms-search"><Search size={17} /><input aria-label="Search articles" placeholder="Search your articles…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="cms-filter"><SlidersHorizontal size={15} /><select aria-label="Filter by category" value={category} onChange={event => { setCategory(event.target.value); setPage(1) }}>{blogCategories.map(item => <option value={item} key={item}>{item === 'All' ? 'All categories' : item}</option>)}</select></label></div>
      {error && <CmsError message={error} retry={() => void fetchBlogs()} />}
      {loading ? <CmsLoading label="Loading articles…" /> : blogs.length ? <><div className="cms-table-scroll"><table className="cms-table cms-articles-table"><thead><tr><th scope="col">Article</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Actions</th></tr></thead><tbody>{blogs.map((blog, index) => <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchBlogs} index={index + 1} />)}</tbody></table></div><CmsPagination page={page} total={total} pageSize={8} onChange={setPage} /></> : !error && <CmsEmpty title={search || status !== 'all' || category !== 'All' ? 'No matching articles' : 'Your next story starts here.'} description={search || status !== 'all' || category !== 'All' ? 'Try another search or change your filters.' : 'Open the editor and turn a thought into something worth reading.'}><Link className="cms-button cms-button-secondary" to="/admin/addBlog">Write an article</Link></CmsEmpty>}
    </div>
  </section>
}
export default ListBlog
