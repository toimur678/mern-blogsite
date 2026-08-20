import React from 'react'
import { footer_data } from '../assets/assets'
import { Globe, Send, Rss } from 'lucide-react'

const Footer = () => {
  return (
    <footer className='bg-navy'>
      <div className='max-w-[1280px] mx-auto px-8 sm:px-12 xl:px-0'>
        <div className='flex flex-col md:flex-row items-start justify-between gap-10 py-16 border-b border-white/10'>
          {/* Brand */}
          <div className='max-w-sm'>
            <h2 className='font-heading text-2xl font-bold text-white mb-4'>
              Tech<span className='text-teal-highlight'>Everyday</span>
            </h2>
            <p className='text-white/50 text-base leading-7'>
              Your daily dose of insights on technology, startups, lifestyle, and finance. Read, learn, and grow with us.
            </p>

            {/* Social Icons */}
            <div className='flex gap-4 mt-6'>
              <Globe className='w-6 h-6 text-white/50 hover:text-white transition-opacity cursor-pointer' />
              <Send className='w-6 h-6 text-white/50 hover:text-white transition-opacity cursor-pointer' />
              <Rss className='w-6 h-6 text-white/50 hover:text-white transition-opacity cursor-pointer' />
            </div>
          </div>

          {/* Footer Links */}
          <div className='flex flex-wrap justify-between w-full md:w-[50%] gap-8'>
            {footer_data.map((section, index) => (
              <div key={index}>
                <h3 className='font-semibold text-sm text-white uppercase tracking-wider mb-5'>{section.title}</h3>
                <ul className='space-y-3'>
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a className='text-sm text-white/50 hover:text-teal-highlight transition-colors cursor-pointer' href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='py-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
          <p className='text-sm text-white/40'>© 2025 Tech Everyday. All rights reserved.</p>
          <div className='flex gap-6'>
            <a className='text-sm text-white/40 hover:text-teal-highlight transition-colors cursor-pointer' href="#">Privacy Policy</a>
            <a className='text-sm text-white/40 hover:text-teal-highlight transition-colors cursor-pointer' href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
