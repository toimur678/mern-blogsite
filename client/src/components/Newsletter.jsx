import React from 'react'

const Newsletter = () => {
  return (
    <section className='bg-surface-teal'>
      <div className='max-w-[1280px] mx-auto px-8 sm:px-12 xl:px-0 py-[76px] sm:py-[100px] text-center'>
        <h2 className='font-heading text-2xl sm:text-[40px] font-bold text-navy leading-[48px] mb-4'>
          Never Miss a Blog!
        </h2>
        <p className='text-lg text-[#333333] leading-[28px] max-w-lg mx-auto mb-10'>
          Subscribe to get the latest blog, new tech, and exclusive news delivered right to your inbox.
        </p>

        <form className='flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto'>
          <input 
            type="email" 
            className='w-full sm:flex-1 h-[52px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-5 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
            placeholder='Enter your email' 
            required
          />
          <button 
            type='submit' 
            className='w-full sm:w-auto px-10 h-[52px] bg-accent text-white font-semibold text-base rounded-lg hover:bg-accent-dark transition-colors cursor-pointer'
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}

export default Newsletter
