import { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react'
import { assets, blogCategories } from '../../assets/assets'
import Quill from 'quill'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddBlog = () => {

  const {axios} = useAppContext()
  const [isAdding, setIsAdding] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)


  const [image, setImage] = useState<File | false>(false)
  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [category, setCategory] = useState('Startup')
  const [isPublished, setIsPublished] = useState(false)
  
  const generateContent = async () => {

  }
  
  
  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setIsAdding(true)

      const blog = {
        title, subTitle, description: quillRef.current?.root.innerHTML ?? '', category, isPublished
      }

      const formData = new FormData()
      formData.append('blog', JSON.stringify(blog))
      if (image) {
        formData.append('image', image)
      }

      const {data} = await axios.post('/api/blog/add', formData)
      if(data.success) {
        toast.success(data.message)
        setImage(false)
        setTitle('')
        if (quillRef.current) {
          quillRef.current.root.innerHTML = ''
        }
        setCategory('Startup')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsAdding(false)
    }
  }
  
  useEffect(() => {
    //Initiate quill only once
    if(!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {theme: 'snow'})
    }
  }, []);
  
  return (
    <form onSubmit={onSubmitHandler} className='flex-1 p-6 sm:p-10 bg-surface-input text-navy overflow-y-auto'>
      <div className='bg-surface w-full max-w-4xl p-8 rounded-xl shadow-card'>

        <h2 className='font-heading text-2xl font-bold text-navy mb-6'>Create New Blog</h2>

        <label className='text-sm font-medium text-navy'>Upload thumbnail</label>
        <label htmlFor="image" className='block mt-2 mb-6'>
          <img className='h-16 rounded-[10px] cursor-pointer hover:opacity-80 transition-opacity' src={!image ? assets.upload_area : URL.createObjectURL(image) } alt="" />
          <input onChange={(e: ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || false)} type="file" id='image' hidden required />
        </label>

        <div className='space-y-5'>
          <div>
            <label className='text-sm font-medium text-navy'>Blog Title</label>
            <input 
              onChange={e => setTitle(e.target.value)} 
              value={title} 
              className='w-full max-w-lg mt-2 h-[44px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-4 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
              type="text" 
              placeholder='Type here' 
              required
            />
          </div>

          <div>
            <label className='text-sm font-medium text-navy'>Sub Title</label>
            <input 
              onChange={e => setSubTitle(e.target.value)} 
              value={subTitle} 
              className='w-full max-w-lg mt-2 h-[44px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-4 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
              type="text" 
              placeholder='Type here' 
              required
            />
          </div>

          <div>
            <label className='text-sm font-medium text-navy'>Blog Description</label>
            <div className='max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative'>
              <div ref={editorRef}></div>
              <button className='absolute bottom-1 right-2 ml-2 text-xs text-white bg-primary px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors cursor-pointer' type='button' onClick={generateContent}>Generate with AI</button>
            </div>
          </div>

          <div>
            <label className='text-sm font-medium text-navy'>Blog category</label>
            <select 
              onChange={(e) => setCategory(e.target.value)} 
              value={category} 
              className='mt-2 px-4 py-2.5 bg-surface-input text-navy rounded-[10px] outline-none focus:ring-2 focus:ring-primary transition-all block' 
              name="category"
            >
              <option value="">Select Category</option>
              {blogCategories.map((item, index) => {
                return <option key={index} value={item}>{item}</option>
              })}
            </select>
          </div>

          <div className='flex items-center gap-3'>
            <label className='text-sm font-medium text-navy'>Publish Now</label>
            <input 
              onChange={e => setIsPublished(e.target.checked)} 
              className='w-5 h-5 accent-primary cursor-pointer' 
              type="checkbox" 
              checked={isPublished} 
            />
          </div>
        </div>

        <button 
          disabled={isAdding} 
          className='mt-8 px-8 py-3 bg-primary text-white font-semibold rounded-lg cursor-pointer hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed' 
          type='submit'
        >
          {isAdding ? 'Adding...' : 'Add Blog'}
        </button>

      </div>
    </form>
  )
}

export default AddBlog
