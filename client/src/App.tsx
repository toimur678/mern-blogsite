import { lazy, Suspense, useEffect } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Loader from './components/Loader'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'

const Blog = lazy(() => import('./pages/Blog'))
const Login = lazy(() => import('./pages/Login'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Saved = lazy(() => import('./pages/Saved'))
const Info = lazy(() => import('./pages/Info'))
const Layout = lazy(() => import('./pages/admin/Layout'))
const AddBlog = lazy(() => import('./pages/admin/AddBlog'))
const EditBlog = lazy(() => import('./pages/admin/EditBlog'))
const ListBlog = lazy(() => import('./pages/admin/ListBlog'))
const Comments = lazy(() => import('./pages/admin/Comments'))
const Users = lazy(() => import('./pages/admin/Users'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Subscribers = lazy(() => import('./pages/admin/Subscribers'))
const AdminLogin = lazy(() => import('./components/admin/Login'))

function RouteEffects() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant' }), 80)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}
const NotFound = () => <><Navbar/><main id='main-content' className='site-container static-page'><p className='eyebrow'>404 · A PAGE OUT OF PLACE</p><h1>Another story awaits.</h1><p className='intro'>This page has moved, or the link took a wrong turn.</p><Link className='button button-dark' to='/'>Back to the journal</Link></main><Footer/></>

const App = () => {
  const { isLoggedIn, userRole, authLoading } = useAppContext()
  const staff = isLoggedIn && (userRole === 'admin' || userRole === 'editor')
  return <><a className='skip-link' href='#main-content'>Skip to content</a><Toaster position='bottom-right' toastOptions={{ style: { fontFamily: 'var(--sans)', fontSize: '13px', background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--ink-secondary)', borderRadius: '6px' }, success: { iconTheme: { primary: 'var(--brand-light)', secondary: 'var(--ink)' } }, error: { iconTheme: { primary: 'var(--crimson-wash)', secondary: 'var(--crimson)' } } }}/><RouteEffects/><Suspense fallback={<Loader/>}><Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/blog/:id' element={<Blog/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path='/profile' element={<UserProfile/>}/>
    <Route path='/saved' element={<Saved/>}/>
    <Route path='/about' element={<Info/>}/>
    <Route path='/privacy' element={<Info/>}/>
    <Route path='/admin' element={authLoading ? <Loader/> : staff ? <Layout/> : <AdminLogin/>}>
      <Route index element={<Dashboard/>}/>
      <Route path='addBlog' element={<AddBlog/>}/>
      <Route path='editBlog/:id' element={<EditBlog/>}/>
      <Route path='listBlog' element={<ListBlog/>}/>
      <Route path='comments' element={<Comments/>}/>
      <Route path='users' element={userRole === 'admin' ? <Users/> : <Navigate to='/admin' replace/>}/>
      <Route path='subscribers' element={userRole === 'admin' ? <Subscribers/> : <Navigate to='/admin' replace/>}/>
    </Route>
    <Route path='*' element={<NotFound/>}/>
  </Routes></Suspense></>
}
export default App
