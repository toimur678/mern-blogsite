import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, FilePenLine, MessageSquare, Plus, Users } from 'lucide-react'
import BlogTableItem from '../../components/admin/BlogTableItem'
import { CmsEmpty, CmsError, CmsLoading, CmsPageHeading } from '../../components/admin/CmsUI'
import { useAppContext } from '../../context/AppContext'
import type { DashboardData } from '../../assets/assets'
import { errorMessage } from '../../lib/format'

type StudioDashboard = DashboardData & { published?: number; pendingComments?: number; users?: number; subscribers?: number; totalLikes?: number }
const Dashboard = () => {
  const { axios, userData, userRole } = useAppContext()
  const [dashboardData, setDashboardData] = useState<StudioDashboard | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const fetchDashboard = useCallback(async () => {
    setError('')
    try { const { data } = await axios.get('/api/admin/dashboard'); if (!data.success) throw new Error(data.message); setDashboardData(data.dashboardData) } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) }
  }, [axios])
  useEffect(() => { void fetchDashboard() }, [fetchDashboard])
  const published = dashboardData?.published ?? Math.max(0, (dashboardData?.blogs || 0) - (dashboardData?.drafts || 0))
  const firstName = userData?.name?.split(' ')[0]
  const stats = [
    { label: 'Total articles', value: dashboardData?.blogs || 0, caption: `${published} live on your publication`, icon: BookOpen, to: '/admin/listBlog' },
    { label: 'In the works', value: dashboardData?.drafts || 0, caption: 'Drafts ready for your next edit', icon: FilePenLine, to: '/admin/listBlog' },
    { label: 'Conversations', value: dashboardData?.comments || 0, caption: `${dashboardData?.pendingComments || 0} awaiting a little attention`, icon: MessageSquare, to: '/admin/comments' },
    { label: 'Subscribers', value: dashboardData?.subscribers || 0, caption: 'Readers who want to stay close', icon: Users, to: userRole === 'admin' ? '/admin/subscribers' : '/'  },
  ]
  return <section className="cms-page">
    <CmsPageHeading eyebrow="Your publication at a glance" title={firstName ? `Welcome back, ${firstName}.` : 'A good day to tell a story.'} description="A quiet place to create, publish, and grow your perspective."><Link to="/admin/addBlog" className="cms-button cms-button-primary"><Plus size={16} />Write an article</Link></CmsPageHeading>
    {error && <CmsError message={error} retry={() => void fetchDashboard()} />}
    {loading ? <CmsLoading /> : dashboardData && <>
      {/* Stats Cards */}
      <div className="cms-stats">{stats.map(({ label, value, caption, icon: Icon, to }) => <Link key={label} to={to} className="cms-stat"><div className="cms-stat-label">{label}<Icon size={17} strokeWidth={1.5} /></div><strong>{value.toLocaleString()}</strong><p>{caption}</p></Link>)}</div>
      <div className="cms-dashboard-grid"><div className="cms-dashboard-primary">
        {/* Recent Blogs Table */}
        <div className="cms-section-heading"><div><h2>Fresh from your desk</h2><p>Your most recent articles, all in one place.</p></div><Link to="/admin/listBlog" className="cms-inline-link">View all articles <ArrowRight size={15} /></Link></div>
        <div className="cms-list-panel">{dashboardData.recentBlogs.length ? <div className="cms-table-scroll"><table className="cms-table cms-articles-table cms-recent-table"><thead><tr><th scope="col">Article</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">Created</th><th scope="col">Actions</th></tr></thead><tbody>{dashboardData.recentBlogs.map((blog, index) => <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchDashboard} index={index + 1} />)}</tbody></table></div> : <CmsEmpty title="Your publication is a blank page." description="Every great publication starts with a first article."><Link to="/admin/addBlog" className="cms-button cms-button-secondary">Write your first story</Link></CmsEmpty>}</div>
        <div className="cms-editorial-note"><span className="cms-note-mark">“</span><div><p>The best stories begin with noticing.</p><span>Make a little space for your next idea.</span></div><Link className="cms-icon-button" to="/admin/addBlog" aria-label="Start a new article"><ArrowUpRight size={20} /></Link></div>
      </div><aside className="cms-dashboard-aside"><div className="cms-section-heading"><div><h2>The editorial desk</h2><p>A little care goes a long way.</p></div></div><div className="cms-desk-panel"><span className="cms-eyebrow">Next on your list</span><Link to="/admin/comments" className="cms-desk-item"><span className="cms-desk-icon"><MessageSquare size={18} /></span><div><strong>Join the conversation</strong><p>{dashboardData.pendingComments ? `${dashboardData.pendingComments} comments need your review.` : 'Keep thoughtful conversations going.'}</p></div><ArrowUpRight size={16} /></Link><Link to="/admin/listBlog" className="cms-desk-item"><span className="cms-desk-icon"><FilePenLine size={18} /></span><div><strong>Revisit a draft</strong><p>{dashboardData.drafts ? `${dashboardData.drafts} stories waiting in the wings.` : 'Your next idea deserves a first draft.'}</p></div><ArrowUpRight size={16} /></Link><div className="cms-publication-health"><div><span>Publication balance</span><strong>{dashboardData.blogs ? Math.round(published / dashboardData.blogs * 100) : 0}% published</strong></div><div className="cms-progress" role="progressbar" aria-label="Published articles" aria-valuenow={published} aria-valuemin={0} aria-valuemax={Math.max(1, dashboardData.blogs)}><span style={{ width: `${dashboardData.blogs ? published / dashboardData.blogs * 100 : 0}%` }} /></div><p>{published} published · {dashboardData.drafts} drafts</p></div></div><div className="cms-studio-card"><span className="cms-eyebrow">Your publication</span><h3>Good ideas.<br />Thoughtfully shared.</h3><p>See your stories as your readers do.</p><Link to="/">Open folio. <ArrowUpRight size={15} /></Link></div></aside></div>
    </>}
  </section>
}
export default Dashboard
