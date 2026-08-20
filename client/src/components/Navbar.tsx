import { useState, useRef, useCallback } from 'react'
import { useAppContext } from '../context/AppContext'
import { Shield, Menu, X } from 'lucide-react'

const Navbar = () => {
  const { navigate, isLoggedIn } = useAppContext()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hidden admin access: 5 clicks on logo within 2 seconds
  const clickTimestamps = useRef<number[]>([])
  const REQUIRED_CLICKS = 5
  const TIME_WINDOW = 2000

  const handleLogoClick = useCallback(() => {
    const now = Date.now()
    clickTimestamps.current.push(now)

    // Keep only timestamps within the time window
    clickTimestamps.current = clickTimestamps.current.filter(
      (t) => now - t <= TIME_WINDOW
    )

    if (clickTimestamps.current.length >= REQUIRED_CLICKS) {
      clickTimestamps.current = []
      navigate('/admin')
    } else {
      navigate('/')
    }
  }, [navigate])

  return (
    <nav className='w-full bg-transparent' style={{ zIndex: 100 }}>
      <div className='flex justify-between items-center py-[18px] px-8 sm:px-12 xl:px-0 max-w-[1280px] mx-auto h-[84px]'>
        
        {/* Logo */}
        <div className='flex items-center gap-2'>
          <h1 
            onClick={handleLogoClick} 
            className='font-heading text-xl font-bold text-navy cursor-pointer select-none'
          >
            Tech<span className='text-primary'>Everyday</span>
          </h1>

          {/* Subtle admin indicator (only when logged in) */}
          {isLoggedIn && (
            <button
              onClick={() => navigate('/admin')}
              className='p-1 rounded-md text-primary/40 hover:text-primary hover:bg-surface-teal/50 transition-all cursor-pointer'
              title='Admin Panel'
            >
              <Shield size={14} />
            </button>
          )}
        </div>

        {/* Desktop Nav Links */}
        <div className='hidden md:flex items-center gap-1'>
          <a onClick={() => navigate('/')} className='px-4 py-5 text-base font-normal text-navy cursor-pointer hover:text-primary transition-colors leading-[19.2px]'>Home</a>
          <a className='px-4 py-5 text-base font-medium text-primary cursor-pointer border-b-[3px] border-primary leading-[19.2px]'>Blog</a>
          <a className='px-4 py-5 text-base font-normal text-navy cursor-pointer hover:text-primary transition-colors leading-[19.2px]'>Categories</a>
        </div>

        {/* Desktop — empty spacer to balance layout (no CTA button) */}
        <div className='hidden md:block w-1'></div>

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
        <div className='md:hidden bg-surface border-t border-border px-8 pb-6'>
          <a onClick={() => { navigate('/'); setMobileOpen(false) }} className='block py-3 text-base text-navy cursor-pointer hover:text-primary transition-colors'>Home</a>
          <a className='block py-3 text-base font-medium text-primary cursor-pointer'>Blog</a>
          <a className='block py-3 text-base text-navy cursor-pointer hover:text-primary transition-colors'>Categories</a>
        </div>
      )}
    </nav>
  )
}

export default Navbar
