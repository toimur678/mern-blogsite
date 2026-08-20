import { useRef, FormEvent } from 'react'
import { useAppContext } from '../context/AppContext'

const Header = () => {
  const { setInput, input } = useAppContext()
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputRef.current) {
      setInput(inputRef.current.value)
    }
  }

  const onClear = async () => {
    setInput('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <section className='bg-surface-teal overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center'>
        
        {/* Hero Content */}
        <div className='max-w-2xl'>
          <p className='text-primary font-semibold text-sm tracking-[2px] uppercase mb-3'>BLOG</p>
          
          <h1 className='font-heading text-[36px] sm:text-[52px] font-medium leading-[1.08] text-navy mb-4'>
            Our ideas and insights on{' '}
            <span className='text-primary'>technology, startups,</span>{' '}
            lifestyle, and much more.
          </h1>

          <p className='text-lg text-[#333333] leading-[28px] mb-6'>
            This is your space to think out loud, to share what matters, and to write without filters.
          </p>

          {/* Search */}
          <form onSubmit={onSubmitHandler} className='max-w-xl'>
            <div className='relative'>
              <input 
                ref={inputRef} 
                className='w-full h-12 bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-5 pr-14 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
                type="text" 
                placeholder='Search Blogs' 
                required 
              />
              <button 
                type='submit' 
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer'
              >
                Search
              </button>
            </div>
          </form>

          {input && (
            <button 
              onClick={onClear} 
              className='mt-3 text-sm text-primary font-medium hover:text-primary-dark transition-colors cursor-pointer text-left block'
            >
              ✕ Clear Search
            </button>
          )}
        </div>

        {/* Hero Image */}
        <div className='relative w-full h-full min-h-[300px] sm:min-h-[400px] rounded-2xl overflow-hidden shadow-2xl'>
          <img 
            src="/hero-bg.jpg" 
            alt="Hero background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default Header
