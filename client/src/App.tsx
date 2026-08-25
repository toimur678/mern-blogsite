import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Layout from './pages/admin/Layout'
import AddBlog from './pages/admin/AddBlog'
import EditBlog from './pages/admin/EditBlog'
import ListBlog from './pages/admin/ListBlog'
import Comments from './pages/admin/Comments'
import Users from './pages/admin/Users'
import Dashboard from './pages/admin/Dashboard'
import AdminLogin from './components/admin/Login'
import Login from './pages/Login'
import UserProfile from './pages/UserProfile'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './context/AppContext'

const App = () => {

  const { isLoggedIn, userRole } = useAppContext()

  return (
    <div>
      <Toaster/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/blog/:id' element={<Blog/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<UserProfile/>}/>
        <Route path='/admin' element={(isLoggedIn && (userRole === 'admin' || userRole === 'editor')) ? <Layout/> : <AdminLogin/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='addBlog' element={<AddBlog/>}/>
          <Route path='editBlog/:id' element={<EditBlog/>}/>
          <Route path='listBlog' element={<ListBlog/>}/>
          <Route path='comments' element={<Comments/>}/>
          <Route path='users' element={<Users/>}/>
        </Route>
      </Routes>
    </div>
  )
}

export default App
