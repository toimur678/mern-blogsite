import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => <footer className='site-footer'><div className='site-container'>
  <div className='footer-main'>
    {/* Brand */}
    <div className='footer-brand'><Link className='wordmark' to='/'>folio<span>.</span></Link><p>A journal for a life well considered.</p></div>
    {/* Footer Links */}
    <nav className='footer-links' aria-label='Footer navigation'><Link to='/'>The journal</Link><Link to='/about'>Our story</Link><Link to='/saved'>Reading list</Link><a href='/#newsletter'>The Folio letter <ArrowUpRight size={13}/></a></nav>
  </div>
  {/* Bottom Bar */}
  <div className='footer-bottom'><p>© {new Date().getFullYear()} Folio. Made for curious minds.</p><div><Link to='/privacy'>Privacy & cookies</Link><Link to='/admin'>Editorial studio <ArrowUpRight size={12}/></Link><span>Take your time. Read something good.</span></div></div>
</div></footer>
export default Footer
