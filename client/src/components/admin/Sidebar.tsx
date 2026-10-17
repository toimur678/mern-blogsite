import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, BookOpen, LayoutDashboard, Mail, MessageSquare, PenLine, Users } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

const Sidebar = ({ open = false, onNavigate }: { open?: boolean; onNavigate?: () => void }) => {
  const { userRole } = useAppContext()
  const linkClass = ({ isActive }: { isActive: boolean }) => `cms-nav-link${isActive ? ' cms-nav-active' : ''}`
  return <aside className={`cms-sidebar${open ? ' cms-sidebar-open' : ''}`}>
    <div className="cms-sidebar-top"><span className="cms-sidebar-label">Workspace</span><nav aria-label="Studio navigation">
      <NavLink end to="/admin" className={linkClass} onClick={onNavigate}><LayoutDashboard size={17} />Overview</NavLink>
      <NavLink to="/admin/listBlog" className={linkClass} onClick={onNavigate}><BookOpen size={17} />Articles</NavLink>
      <NavLink to="/admin/comments" className={linkClass} onClick={onNavigate}><MessageSquare size={17} />Comments</NavLink>
      {userRole === 'admin' && <NavLink to="/admin/subscribers" className={linkClass} onClick={onNavigate}><Mail size={17} />Subscribers</NavLink>}
      {userRole === 'admin' && <NavLink to="/admin/users" className={linkClass} onClick={onNavigate}><Users size={17} />Community</NavLink>}
    </nav><Link to="/admin/addBlog" className="cms-button cms-button-primary cms-write-button" onClick={onNavigate}><PenLine size={16} />Write an article</Link></div>
    <div className="cms-sidebar-bottom"><span className="cms-sidebar-label">Made for good stories.</span><p>A little perspective.<br />A lasting impression.</p><Link to="/" onClick={onNavigate}>Visit folio. <ArrowUpRight size={14} /></Link></div>
  </aside>
}
export default Sidebar
