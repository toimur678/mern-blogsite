import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ArrowUpRight, LogOut, Menu, X } from 'lucide-react'
import Sidebar from '../../components/admin/Sidebar'
import { useAppContext } from '../../context/AppContext'
import '../../admin.css'

const Layout = () => {
  const { userRole, userData, logout } = useAppContext()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="cms-app">
      {/* Admin Header */}
      <header className="cms-header">
        <div className="cms-header-brand">
          <button className="cms-icon-button cms-menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <Link to="/" className="cms-wordmark">folio<span>.</span></Link><span className="cms-studio-label">Editorial studio</span>
        </div>
        <div className="cms-header-actions">
          <Link to="/" className="cms-public-link">View publication <ArrowUpRight size={15} /></Link><span className="cms-header-divider" />
          <div className="cms-account"><span className="cms-avatar">{(userData?.name || userRole || 'E').charAt(0).toUpperCase()}</span><span><strong>{userData?.name || 'Editorial team'}</strong><small>{userRole}</small></span></div>
          <button onClick={() => void logout()} className="cms-icon-button" aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
        </div>
      </header>
      <div className="cms-workspace">
        {menuOpen && <button className="cms-sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <main id="main-content" className="cms-main" tabIndex={-1}><Outlet /></main>
      </div>
    </div>
  )
}
export default Layout
