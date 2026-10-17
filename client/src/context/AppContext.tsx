import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import axios from 'axios'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { BlogData } from '../assets/assets'
import { sampleStories } from '../data/sampleStories'
import { errorMessage } from '../lib/format'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || ''
axios.defaults.withCredentials = true
axios.defaults.timeout = 12000

export type UserRole = 'admin' | 'editor' | 'user' | null
export interface UserData { id: string; name: string; email: string; role: UserRole }
interface AppContextType {
  axios: typeof axios
  navigate: NavigateFunction
  isLoggedIn: boolean
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
  userRole: UserRole
  setUserRole: React.Dispatch<React.SetStateAction<UserRole>>
  userData: UserData | null
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>
  blogs: BlogData[]
  setBlogs: React.Dispatch<React.SetStateAction<BlogData[]>>
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  logout: () => Promise<void>
  authLoading: boolean
  blogsLoading: boolean
  blogsError: string
  refreshBlogs: () => Promise<void>
  demoMode: boolean
  savedIds: string[]
  toggleSaved: (id: string) => void
}
const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [blogs, setBlogs] = useState<BlogData[]>([])
  const [input, setInput] = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [blogsLoading, setBlogsLoading] = useState(true)
  const [blogsError, setBlogsError] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const attemptedSaved = useRef(new Set<string>())
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem('folio:saved') || '[]')
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
    } catch { return [] }
  })

  const refreshBlogs = useCallback(async () => {
    setBlogsLoading(true)
    setBlogsError('')
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setBlogs(sampleStories)
        setDemoMode(true)
        return
      }
      const { data } = await axios.get('/api/blog/all', { params: { limit: 100 } })
      if (!data.success || !Array.isArray(data.blogs)) throw new Error(data.message || 'Stories are unavailable.')
      let stories: BlogData[] = data.blogs
      try {
        const featured = await axios.get('/api/blog/all', { params: { featured: true, limit: 1 } })
        const pick: BlogData | undefined = featured.data.success ? featured.data.blogs?.[0] : undefined
        if (pick && !stories.some(story => story._id === pick._id)) stories = [...stories, pick]
      } catch { /* Latest articles remain available if the featured query fails. */ }
      setBlogs(stories)
      setDemoMode(false)
    } catch (error) {
      if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE !== 'false') {
        setBlogs(sampleStories)
        setDemoMode(true)
      } else {
        setBlogsError(errorMessage(error))
      }
    } finally { setBlogsLoading(false) }
  }, [])

  useEffect(() => {
    if (blogsLoading || demoMode) return
    const missing = savedIds.filter(id => !id.startsWith('demo-') && !blogs.some(blog => blog._id === id) && !attemptedSaved.current.has(id))
    if (!missing.length) return
    missing.forEach(id => attemptedSaved.current.add(id))
    void Promise.allSettled(missing.map(id => axios.get(`/api/blog/${encodeURIComponent(id)}`))).then(results => {
      const found = results.flatMap(result => result.status === 'fulfilled' && result.value.data.success ? [result.value.data.blog as BlogData] : [])
      if (found.length) setBlogs(previous => [...previous, ...found.filter(blog => !previous.some(item => item._id === blog._id))])
    })
  }, [savedIds, blogs, blogsLoading, demoMode])

  const toggleSaved = useCallback((id: string) => {
    setSavedIds(previous => {
      const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]
      try { localStorage.setItem('folio:saved', JSON.stringify(next)) } catch { /* Browser storage may be disabled. */ }
      return next
    })
  }, [])

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
      setIsLoggedIn(false)
      setUserRole(null)
      setUserData(null)
      navigate('/')
      toast.success('You have signed out.')
    } catch (error) { toast.error(errorMessage(error)) }
  }

  useEffect(() => {
    void refreshBlogs()
    let active = true
    axios.get('/api/auth/check-auth').then(({ data }) => {
      if (active && data.success) {
        setIsLoggedIn(true)
        setUserRole(data.role)
        setUserData(data.user)
      }
    }).catch(() => {
      // Not authenticated — silently ignore
    }).finally(() => { if (active) setAuthLoading(false) })
    return () => { active = false }
  }, [refreshBlogs])

  return <AppContext.Provider value={{ axios, navigate, isLoggedIn, setIsLoggedIn, userRole, setUserRole, userData, setUserData, blogs, setBlogs, input, setInput, logout, authLoading, blogsLoading, blogsError, refreshBlogs, demoMode, savedIds, toggleSaved }}>{children}</AppContext.Provider>
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within an AppProvider')
  return context
}
