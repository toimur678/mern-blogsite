import { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { assets, blogCategories } from '../../assets/assets'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import InlineCode from '@editorjs/inline-code'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const EditBlog = () => {
  const { id } = useParams<{id: string}>()
  const {axios} = useAppContext()
  const navigate = useNavigate()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<EditorJS | null>(null)

  const [image, setImage] = useState<File | false>(false)
  const [existingImage, setExistingImage] = useState<string>('')
  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [category, setCategory] = useState('Startup')
  const [isPublished, setIsPublished] = useState(false)
  const [initialBlocks, setInitialBlocks] = useState<any>(null)
  
  const [isGenerating, setIsGenerating] = useState(false)

  const generateContent = async () => {
    if (!title) {
      toast.error("Please enter a blog title first to generate content")
      return
    }

    try {
      setIsGenerating(true)
      const { data } = await axios.post('/api/blog/generate', { title, subTitle })
      
      if (data.success && data.blocks) {
        if (editorInstanceRef.current) {
          // Replace or append to current content
          await editorInstanceRef.current.render({ blocks: data.blocks })
          toast.success("Content generated successfully!")
        }
      } else {
        toast.error(data.message || "Failed to generate content")
      }
    } catch (error) {
      toast.error((error as Error).message || "Error generating content")
    } finally {
      setIsGenerating(false)
    }
  }
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`/api/blog/${id}`)
        if (data.success) {
          setTitle(data.blog.title)
          setSubTitle(data.blog.subTitle)
          setCategory(data.blog.category)
          setIsPublished(data.blog.isPublished)
          setExistingImage(data.blog.image)
          setInitialBlocks(data.blog.description)
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error('Failed to load blog')
      } finally {
        setIsFetching(false)
      }
    }
    fetchBlog()
  }, [id])

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setIsUpdating(true)

      // Get Editor.js content as JSON
      const editorData = await editorInstanceRef.current?.save()

      if (!editorData || editorData.blocks.length === 0) {
        toast.error('Please add some content to the blog')
        setIsUpdating(false)
        return
      }

      const blog = {
        title, subTitle, description: editorData, category, isPublished
      }

      const formData = new FormData()
      formData.append('blog', JSON.stringify(blog))
      if (image) {
        formData.append('image', image)
      }

      const {data} = await axios.put(`/api/blog/edit/${id}`, formData)
      if(data.success) {
        toast.success(data.message)
        navigate('/admin/listBlog')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsUpdating(false)
    }
  }
  
  useEffect(() => {
    // Initialize Editor.js only once after data is fetched
    if(!isFetching && !editorInstanceRef.current && editorRef.current) {
      editorInstanceRef.current = new EditorJS({
        holder: editorRef.current,
        placeholder: 'Start writing your blog content...',
        data: initialBlocks,
        tools: {
          header: {
            class: Header as unknown as EditorJS.ToolConstructable,
            config: {
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            }
          },
          list: {
            class: List as unknown as EditorJS.ToolConstructable,
            inlineToolbar: true,
          },
          quote: {
            class: Quote as unknown as EditorJS.ToolConstructable,
            inlineToolbar: true,
          },
          delimiter: Delimiter as unknown as EditorJS.ToolConstructable,
          inlineCode: {
            class: InlineCode as unknown as EditorJS.ToolConstructable,
          },
        },
      })
    }

    return () => {
      if (editorInstanceRef.current?.destroy) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [isFetching, initialBlocks]);
  
  if (isFetching) {
    return <div className='flex-1 p-6 sm:p-10 flex items-center justify-center'>Loading...</div>
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex-1 p-6 sm:p-10 bg-surface-input text-navy overflow-y-auto'>
      <div className='bg-surface w-full max-w-4xl p-8 rounded-xl shadow-card'>

        <h2 className='font-heading text-2xl font-bold text-navy mb-6'>Edit Blog</h2>

        <label className='text-sm font-medium text-navy'>Upload new thumbnail (Optional)</label>
        <label htmlFor="image" className='block mt-2 mb-6'>
          <img className='h-32 object-cover rounded-[10px] cursor-pointer hover:opacity-80 transition-opacity' src={!image ? existingImage : URL.createObjectURL(image) } alt="" />
          <input onChange={(e: ChangeEvent<HTMLInputElement>) => setImage(e.target.files?.[0] || false)} type="file" id='image' hidden />
        </label>

        <div className='space-y-5'>
          <div>
            <label className='text-sm font-medium text-navy'>Blog Title</label>
            <input 
              onChange={e => setTitle(e.target.value)} 
              value={title} 
              className='w-full mt-2 h-[44px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-4 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all border border-border' 
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
              className='w-full mt-2 h-[44px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-4 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all border border-border' 
              type="text" 
              placeholder='Type here' 
              required
            />
          </div>

          <div>
            <label className='text-sm font-medium text-navy'>Blog Description</label>
            <div className='w-full mt-2 relative'>
              <div 
                ref={editorRef} 
                className='editorjs-container min-h-[300px] bg-surface-input rounded-[10px] border border-border px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface transition-all'
              />
              <button 
                className='mt-3 text-sm font-medium text-white bg-primary px-5 py-2 flex items-center gap-2 rounded-lg hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm' 
                type='button' 
                onClick={generateContent}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : <><Sparkles className='w-4 h-4' /> Generate with AI</>}
              </button>
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
          disabled={isUpdating} 
          className='mt-8 px-8 py-3 bg-primary text-white font-semibold rounded-lg cursor-pointer hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed' 
          type='submit'
        >
          {isUpdating ? 'Updating...' : 'Update Blog'}
        </button>

      </div>
    </form>
  )
}

export default EditBlog
