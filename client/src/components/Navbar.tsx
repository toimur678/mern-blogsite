import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, ArrowRight, Bookmark, ChevronDown } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { initials } from '../lib/format'

const Navbar = () => {
  const { isLoggedIn, userRole, userData, logout, savedIds, demoMode } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Handle outside click for dropdowns
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setShowProfileMenu(false)
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMobileOpen(false); setShowProfileMenu(false) } }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape) }
  }, [])
  useEffect(() => { setMobileOpen(false); setShowProfileMenu(false) }, [location.pathname, location.search])

  return <header className='site-header'>
    <div className='top-announcement'>
      <div className='site-container top-announcement-inner'>
        <p>Get weekly updates with our <a href='/#newsletter'>Newsletter</a>{demoMode && <span className='sample-label'>SAMPLE EDITION</span>}</p>
      </div>
    </div>
    <div className='site-container nav-inner'>
      {/* Logo */}
      <Link className='wordmark' to='/' aria-label='Folio home'>folio<span>.</span></Link>
      {/* Desktop Nav Links */}
      <nav className='desktop-nav' aria-label='Main navigation'>
        <NavLink to='/' end className={({ isActive }) => isActive && !location.hash ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        <a className={`nav-link ${location.hash === '#stories' ? 'active' : ''}`} href='/#stories'>Articles</a>
        <a className={`nav-link ${location.hash === '#categories' ? 'active' : ''}`} href='/#categories'>Categories</a>
        <NavLink className='nav-link' to='/about'>About</NavLink>
        <NavLink className='nav-link' to='/saved'>Reading list</NavLink>
      </nav>
      {/* Desktop — Join / Profile */}
      <div className='nav-actions'>
        <button className='icon-button nav-search' aria-label='Search stories' onClick={() => navigate('/?search=open#stories')}><Search size={18}/></button>
        <Link className='nav-saved-pill' to='/saved' aria-label={`Saved stories (${savedIds.length})`}><Bookmark size={15}/><span>Saved ({savedIds.length})</span></Link>
        <Link className='nav-saved icon-button' to='/saved' aria-label='Saved stories'><Bookmark size={18}/></Link>
        <span className='nav-divider'/>
        {isLoggedIn ? <div className='profile-menu' ref={profileRef}>
          <button className='profile-trigger' onClick={() => setShowProfileMenu(value => !value)} aria-expanded={showProfileMenu} aria-controls='account-menu'><span className='avatar'>{initials(userData?.name || 'Reader')}</span><ChevronDown size={13}/></button>
          {showProfileMenu && <div id='account-menu' className='account-dropdown'>
            <span className='account-name'>{userData?.name}</span>
            <Link to='/profile'>Your account</Link><Link to='/saved'>Saved stories</Link>
            {(userRole === 'admin' || userRole === 'editor') && <Link to='/admin'>Editorial studio</Link>}
            <button onClick={() => void logout()}>Sign out</button>
          </div>}
        </div> : <Link className='sign-in-link' to='/login'>Sign in</Link>}
        <a className='button button-dark nav-subscribe' href='/#newsletter'>Subscribe <ArrowRight size={15}/></a>
        {/* Mobile Hamburger */}
        <button className='icon-button mobile-toggle' onClick={() => setMobileOpen(value => !value)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls='mobile-navigation'>{mobileOpen ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </div>
    {/* Mobile Menu */}
    {mobileOpen && <nav id='mobile-navigation' className='mobile-navigation' aria-label='Mobile navigation'><Link to='/'>Home</Link><a href='/#stories' onClick={() => setMobileOpen(false)}>Articles</a><a href='/#categories' onClick={() => setMobileOpen(false)}>Categories</a><Link to='/about'>About</Link><Link to='/saved'>Saved ({savedIds.length})</Link>{!isLoggedIn && <Link to='/login'>Sign in</Link>}<a href='/#newsletter' onClick={() => setMobileOpen(false)}>Subscribe to the newsletter <ArrowRight size={16}/></a></nav>}
  </header>
}
export default Navbar

