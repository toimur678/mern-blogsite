import { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { Menu, X, ChevronDown, User as UserIcon } from 'lucide-react'

const Navbar = () => {
  const { navigate, isLoggedIn, userRole, userData, logout } = useAppContext()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  const categoryRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Categories list (example)
  const categories = ['Technology', 'Startups', 'Lifestyle', 'Programming', 'Design']

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategories(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className='w-full bg-transparent relative' style={{ zIndex: 100 }}>
      <div className='flex justify-between items-center py-[18px] px-8 sm:px-12 xl:px-0 max-w-[1280px] mx-auto h-[84px]'>
        
        {/* Logo */}
        <div className='flex items-center gap-2'>
          <h1 
            onClick={() => navigate('/')} 
            className='font-heading text-xl font-bold text-navy cursor-pointer select-none'
          >
            LittleTech<span className='text-primary'>Tips</span>
          </h1>
        </div>

        {/* Desktop Nav Links */}
        <div className='hidden md:flex items-center gap-1'>
          <a onClick={() => navigate('/')} className='px-4 py-5 text-base font-normal text-navy cursor-pointer hover:text-primary transition-colors leading-[19.2px]'>Home</a>
          <a onClick={() => navigate('/')} className='px-4 py-5 text-base font-normal text-navy cursor-pointer hover:text-primary transition-colors leading-[19.2px]'>Blog</a>
          
          <div className='relative' ref={categoryRef}>
            <button 
              onClick={() => setShowCategories(!showCategories)}
              className='flex items-center gap-1 px-4 py-5 text-base font-normal text-navy cursor-pointer hover:text-primary transition-colors leading-[19.2px]'
            >
              Categories <ChevronDown size={16} className={`transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategories && (
              <div className='absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg py-2 border border-border animate-fade-in'>
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => {
                      // Optionally add category filter logic here
                      setShowCategories(false)
                      navigate('/')
                    }}
                    className='w-full text-left px-4 py-2 text-navy hover:bg-surface-teal hover:text-primary transition-colors'
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop — Join / Profile */}
        <div className='hidden md:flex items-center'>
          {!isLoggedIn ? (
            <button 
              onClick={() => navigate('/login')}
              className='bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg'
            >
              Join
            </button>
          ) : (
            <div className='relative' ref={profileRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='flex items-center gap-2 bg-surface-teal px-4 py-2 rounded-xl text-navy hover:bg-surface transition-colors border border-border'
              >
                <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                  <UserIcon size={16} />
                </div>
                <span className='font-medium text-sm'>{userData?.name || 'Profile'}</span>
              </button>

              {showProfileMenu && (
                <div className='absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-border animate-fade-in'>
                  <div className='px-4 py-2 border-b border-border mb-1'>
                    <p className='text-sm font-medium text-navy truncate'>{userData?.name}</p>
                    <p className='text-xs text-navy/60 truncate'>{userData?.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate('/profile') }}
                    className='w-full text-left px-4 py-2 text-sm text-navy hover:bg-surface-teal hover:text-primary transition-colors'
                  >
                    My Profile
                  </button>
                  
                  {(userRole === 'admin' || userRole === 'editor') && (
                    <button 
                      onClick={() => { setShowProfileMenu(false); navigate('/admin') }}
                      className='w-full text-left px-4 py-2 text-sm text-navy hover:bg-surface-teal hover:text-primary transition-colors'
                    >
                      Admin Panel
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { setShowProfileMenu(false); logout() }}
                    className='w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-border pt-2'
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className='md:hidden p-2 text-navy cursor-pointer hover:text-primary transition-colors'
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className='md:hidden bg-surface border-t border-border px-8 pb-6 absolute w-full left-0 z-50 shadow-xl'>
          <a onClick={() => { navigate('/'); setMobileOpen(false) }} className='block py-3 text-base text-navy cursor-pointer hover:text-primary transition-colors'>Home</a>
          <a onClick={() => { navigate('/'); setMobileOpen(false) }} className='block py-3 text-base text-navy cursor-pointer hover:text-primary transition-colors'>Blog</a>
          
          <div className='py-3'>
            <p className='text-base text-navy font-medium mb-2'>Categories</p>
            <div className='pl-4 space-y-2'>
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setMobileOpen(false)}
                  className='block w-full text-left text-sm text-navy/70 hover:text-primary transition-colors'
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className='border-t border-border mt-4 pt-4'>
            {!isLoggedIn ? (
              <button 
                onClick={() => { navigate('/login'); setMobileOpen(false) }}
                className='w-full bg-primary text-white px-4 py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors'
              >
                Join Now
              </button>
            ) : (
              <div className='space-y-2'>
                <button 
                  onClick={() => { navigate('/profile'); setMobileOpen(false) }}
                  className='block w-full text-left py-2 text-navy hover:text-primary font-medium transition-colors'
                >
                  My Profile
                </button>
                {(userRole === 'admin' || userRole === 'editor') && (
                  <button 
                    onClick={() => { navigate('/admin'); setMobileOpen(false) }}
                    className='block w-full text-left py-2 text-navy hover:text-primary transition-colors'
                  >
                    Admin Panel
                  </button>
                )}
                <button 
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className='block w-full text-left py-2 text-red-500 hover:text-red-600 transition-colors'
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
