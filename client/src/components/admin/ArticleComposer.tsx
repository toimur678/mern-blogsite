import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Check, ImagePlus, LoaderCircle, Save, Sparkles, X } from 'lucide-react'
import EditorJS, { type OutputData, type ToolConstructable } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import InlineCode from '@editorjs/inline-code'
import { blogCategories, extractTextFromBlocks, type EditorOutputData } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { errorMessage } from '../../lib/format'
import { CmsError, CmsLoading } from './CmsUI'
import toast from 'react-hot-toast'

function contentData(value: unknown): OutputData {
  if (value && typeof value === 'object' && 'blocks' in value && Array.isArray(value.blocks)) return value as OutputData
  if (typeof value === 'string') {
    try { return contentData(JSON.parse(value)) } catch { return { blocks: [{ type: 'paragraph', data: { text: value } }] } }
  }
  return { blocks: [] }
}

const ArticleComposer = ({ id }: { id?: string }) => {
  const { axios, userData, refreshBlogs } = useAppContext()
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<EditorJS | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [editorReady, setEditorReady] = useState(false)
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null)
  const [generating, setGenerating] = useState(false)
  const [initialBlocks, setInitialBlocks] = useState<OutputData>({ blocks: [] })
  const [title, setTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [category, setCategory] = useState('Technology')
  const [author, setAuthor] = useState(userData?.name || 'Folio editorial')
  const [tags, setTags] = useState('')
  const [featured, setFeatured] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [editorError, setEditorError] = useState('')
  const dirtyRef = useRef(false)
  const markDirty = () => { dirtyRef.current = true; setDirty(true) }

  const fetchArticle = useCallback(async () => {
    if (!id) return
    setLoading(true); setLoadError('')
    try {
      const { data } = await axios.get(`/api/admin/blogs/${id}`)
      if (!data.success) throw new Error(data.message || 'Unable to load this article.')
      const blog = data.blog
      setTitle(blog.title || ''); setSubTitle(blog.subTitle || ''); setCategory(blog.category || 'Technology')
      setAuthor(blog.authorName || 'Folio editorial'); setTags((blog.tags || []).join(', ')); setFeatured(Boolean(blog.featured)); setIsPublished(Boolean(blog.isPublished)); setImageUrl(blog.image || '')
      const content = contentData(blog.description)
      setInitialBlocks(content); setWordCount(extractTextFromBlocks(content as EditorOutputData).split(/\s+/).filter(Boolean).length)
      dirtyRef.current = false; setDirty(false)
    } catch (error) { setLoadError(errorMessage(error)) } finally { setLoading(false) }
  }, [axios, id])
  useEffect(() => { void fetchArticle() }, [fetchArticle])
  useEffect(() => {
    if (!image) { setImagePreview(''); return }
    const preview = URL.createObjectURL(image)
    setImagePreview(preview)
    return () => URL.revokeObjectURL(preview)
  }, [image])
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirtyRef.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [])
  useEffect(() => {
    if (loading || loadError || !editorRef.current) return
    let disposed = false
    // Initialize Editor.js only once after data is fetched
    // Initialize Editor.js only once
    const editor = new EditorJS({
      holder: editorRef.current,
      placeholder: 'Start with a thought worth sharing. Press Tab for more tools…',
      data: initialBlocks,
      minHeight: 320,
      tools: {
        header: { class: Header as unknown as ToolConstructable, config: { levels: [2, 3, 4], defaultLevel: 2 } },
        list: { class: List as unknown as ToolConstructable, inlineToolbar: true },
        quote: { class: Quote as unknown as ToolConstructable, inlineToolbar: true },
        delimiter: Delimiter as unknown as ToolConstructable,
        inlineCode: { class: InlineCode as unknown as ToolConstructable },
      },
      onChange: async api => {
        dirtyRef.current = true; setDirty(true)
        try { const output = await api.saver.save(); if (!disposed) setWordCount(extractTextFromBlocks(output as EditorOutputData).split(/\s+/).filter(Boolean).length) } catch { /* Editor may be closing while a block changes. */ }
      },
    })
    editorInstanceRef.current = editor
    void editor.isReady.then(() => { if (!disposed) setEditorReady(true) }).catch(() => { if (!disposed) setEditorError('The editor could not start. Reload this page to try again.') })
    return () => {
      disposed = true; setEditorReady(false)
      void editor.isReady.then(() => editor.destroy()).catch(() => undefined)
      if (editorInstanceRef.current === editor) editorInstanceRef.current = null
    }
  }, [loading, loadError, initialBlocks])

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { toast.error('Choose a JPG, PNG, WebP, or GIF image.'); event.target.value = ''; return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Cover images must be 5 MB or smaller.'); event.target.value = ''; return }
    setImage(file); event.target.value = ''; markDirty()
  }
  const generateContent = async () => {
    if (title.trim().length < 3) { toast.error('Add a title of at least 3 characters first.'); return }
    if (wordCount > 0 && !window.confirm('Replace the current article body with an AI draft? Your title and publication settings will be kept.')) return
    setGenerating(true)
    try {
      const { data } = await axios.post('/api/blog/generate', { title: title.trim(), subTitle: subTitle.trim() })
      if (!data.success || !Array.isArray(data.blocks)) throw new Error(data.message || 'Unable to generate a draft.')
      // Replace or append to current content
      await editorInstanceRef.current?.render({ blocks: data.blocks })
      markDirty(); toast.success('Draft generated. Review and edit it before publishing.')
    } catch (error) { toast.error(errorMessage(error)) } finally { setGenerating(false) }
  }
  const save = async (publish: boolean) => {
    setSaveError('')
    if (title.trim().length < 3) { setSaveError('Give your article a title of at least 3 characters.'); document.getElementById('article-title')?.focus(); return }
    if (!image && !imageUrl.trim()) { setSaveError('Add a cover image or an HTTPS image URL.'); document.getElementById('article-image-url')?.focus(); return }
    if (imageUrl.trim() && !image && !/^https:\/\//i.test(imageUrl.trim())) { setSaveError('Your cover image URL must start with https://.'); return }
    const chosenTags = tags.split(',').map(tag => tag.trim()).filter(Boolean)
    if (chosenTags.length > 8 || chosenTags.some(tag => tag.length > 30)) { setSaveError('Choose up to 8 tags, each 30 characters or fewer.'); return }
    if (author.trim() && author.trim().length < 2) { setSaveError('Author name must contain at least 2 characters.'); return }
    if (!editorReady || saving || generating) return
    setSaving(publish ? 'publish' : 'draft')
    try {
      // Get Editor.js content as JSON
      const editorData = await editorInstanceRef.current?.save()
      if (!editorData) throw new Error('The editor is still starting. Please try again.')
      if (publish && !extractTextFromBlocks(editorData as EditorOutputData).trim()) throw new Error('Add some article content before publishing.')
      const blog = { title: title.trim(), subTitle: subTitle.trim(), description: editorData, category, isPublished: publish, authorName: author.trim() || 'Folio editorial', tags: chosenTags, featured, image: imageUrl.trim() || undefined }
      const formData = new FormData()
      formData.append('blog', JSON.stringify(blog))
      if (image) formData.append('image', image)
      const { data } = id ? await axios.put(`/api/blog/edit/${id}`, formData) : await axios.post('/api/blog/add', formData)
      if (!data.success) throw new Error(data.message || 'Unable to save this article.')
      dirtyRef.current = false; setDirty(false); setIsPublished(publish)
      toast.success(publish ? id ? 'Article updated and published' : 'Your article is published' : 'Draft saved')
      await refreshBlogs()
      navigate('/admin/listBlog')
    } catch (error) { setSaveError(errorMessage(error)) } finally { setSaving(null) }
  }
  const onSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void save(true) }
  if (loading) return <section className="cms-page"><CmsLoading label="Opening your article…" /></section>
  if (loadError) return <section className="cms-page"><CmsError message={loadError} retry={() => void fetchArticle()} /><Link to="/admin/listBlog" className="cms-button cms-button-secondary">Back to articles</Link></section>
  return <form onSubmit={onSubmit} className="cms-page cms-composer">
    <div className="cms-composer-top"><Link to="/admin/listBlog" className="cms-inline-link" onClick={event => { if (dirty && !window.confirm('Leave the editor? Your unsaved changes will be lost.')) event.preventDefault() }}><ArrowLeft size={15} />All articles</Link><span className="cms-save-state">{dirty ? 'Unsaved changes' : id ? <><Check size={14} />All changes saved</> : 'A fresh page, a new perspective'}</span></div>
    <div className="cms-page-heading"><div><p className="cms-eyebrow">The writing room</p><h1>{id ? 'Make a good story better.' : 'A story worth telling.'}</h1><p className="cms-page-description">Find your words. Give them a home.</p></div><div className="cms-page-actions"><button type="button" disabled={Boolean(saving) || generating || !editorReady} className="cms-button cms-button-secondary" onClick={() => void save(false)}>{saving === 'draft' ? <LoaderCircle size={16} className="cms-spin" /> : <Save size={16} />}Save draft</button><button type="submit" disabled={Boolean(saving) || generating || !editorReady} className="cms-button cms-button-primary">{saving === 'publish' ? <LoaderCircle size={16} className="cms-spin" /> : <ArrowUpRight size={16} />}{id && isPublished ? 'Update article' : 'Publish article'}</button></div></div>
    {saveError && <CmsError message={saveError} />}
    <div className="cms-composer-grid"><div className="cms-writing-paper"><label htmlFor="article-title" className="cms-sr-only">Article title</label><textarea id="article-title" className="cms-title-input" placeholder="Give your story a title…" value={title} maxLength={180} rows={2} onChange={event => { setTitle(event.target.value); markDirty() }} required /><label htmlFor="article-subtitle" className="cms-sr-only">Article excerpt</label><textarea id="article-subtitle" className="cms-subtitle-input" placeholder="A line or two to draw your readers in…" value={subTitle} maxLength={320} rows={2} onChange={event => { setSubTitle(event.target.value); markDirty() }} /><div className="cms-editor-toolbar"><span>Article body</span><button type="button" disabled={generating || Boolean(saving) || !editorReady} className="cms-text-button cms-ai-button" onClick={() => void generateContent()}>{generating ? <LoaderCircle size={14} className="cms-spin" /> : <Sparkles size={14} />}{generating ? 'Finding the words…' : 'Start with AI'}</button></div>{editorError && <CmsError message={editorError} />}<div ref={editorRef} className="cms-editor editorjs-container" /><div className="cms-editor-footer"><span>{wordCount.toLocaleString()} words</span><span>{Math.max(1, Math.ceil(wordCount / 220))} min read</span><span>Press Tab to add a block</span></div></div>
    <aside className="cms-composer-settings"><div className="cms-settings-panel"><h2>Publication details</h2><div className="cms-settings-status"><span>Status</span><span className={`cms-status${isPublished ? ' cms-status-published' : ''}`}><i />{isPublished ? 'Published' : 'Draft'}</span></div><label className="cms-field" htmlFor="article-category"><span>Category</span><select id="article-category" value={category} onChange={event => { setCategory(event.target.value); markDirty() }}>{blogCategories.filter(item => item !== 'All').map(item => <option key={item}>{item}</option>)}</select></label><label className="cms-field" htmlFor="article-author"><span>Author name</span><input id="article-author" value={author} maxLength={80} onChange={event => { setAuthor(event.target.value); markDirty() }} placeholder="Folio editorial" /></label><label className="cms-field" htmlFor="article-tags"><span>Tags</span><input id="article-tags" value={tags} onChange={event => { setTags(event.target.value); markDirty() }} placeholder="design, culture, ideas" /><small>Separate up to 8 tags with commas.</small></label><label className="cms-featured-toggle"><input type="checkbox" checked={featured} onChange={event => { setFeatured(event.target.checked); markDirty() }} /><span><strong>Editor’s pick</strong><small>Feature this story on the homepage.</small></span></label></div>
    <div className="cms-settings-panel"><h2>Cover image</h2><p className="cms-settings-description">Set the tone before the first word.</p><div className="cms-cover-preview">{imagePreview || imageUrl ? <img src={imagePreview || imageUrl} alt="Article cover preview" onError={event => { event.currentTarget.style.visibility = 'hidden' }} onLoad={event => { event.currentTarget.style.visibility = 'visible' }} /> : <div><ImagePlus size={26} strokeWidth={1.4} /><span>A visual first impression</span></div>}</div><label className="cms-button cms-button-secondary cms-upload-label" htmlFor="article-cover"><ImagePlus size={15} />{imagePreview || imageUrl ? 'Change image' : 'Upload cover'}<input type="file" id="article-cover" accept="image/jpeg,image/png,image/webp,image/gif" className="cms-sr-only" onChange={selectImage} /></label>{image && <div className="cms-selected-file"><span>{image.name}</span><button type="button" className="cms-icon-button" aria-label="Remove selected image" onClick={() => { setImage(null); markDirty() }}><X size={13} /></button></div>}<p className="cms-upload-help">JPG, PNG, WebP, GIF · Up to 5 MB</p><label className="cms-field" htmlFor="article-image-url"><span>Or use an image URL</span><input id="article-image-url" type="url" placeholder="https://…" value={imageUrl} disabled={Boolean(image)} onChange={event => { setImageUrl(event.target.value); markDirty() }} /></label></div><p className="cms-writing-tip">Good stories take their time.<br />Save a draft. Come back with fresh eyes.</p></aside></div>
  </form>
}
export default ArticleComposer
