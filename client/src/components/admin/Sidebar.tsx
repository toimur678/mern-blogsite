import { NavLink } from 'react-router-dom'
import { Home, PlusCircle, List, MessageSquare, Users } from 'lucide-react'

const Sidebar = () => {
  const linkClass = ({isActive}: {isActive: boolean}) => 
    `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-64 cursor-pointer text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-surface-teal text-primary border-r-[3px] border-primary' 
        : 'text-[#333] hover:text-primary hover:bg-surface-teal/30'
    }`

  return (
    <div className='flex flex-col border-r border-border min-h-full pt-4 bg-surface'>

      <NavLink className={linkClass} end={true} to='/admin'>
        <Home className='min-w-4 w-5 h-5' />
        <p className='hidden md:inline-block'>Dashboard</p>
      </NavLink>
      
      <NavLink className={linkClass} to='/admin/addBlog'>
        <PlusCircle className='min-w-4 w-5 h-5' />
        <p className='hidden md:inline-block'>Add blogs</p>
      </NavLink>
      
      <NavLink className={linkClass} to='/admin/listBlog'>
        <List className='min-w-4 w-5 h-5' />
        <p className='hidden md:inline-block'>Blog lists</p>
      </NavLink>
      
      <NavLink className={linkClass} to='/admin/comments'>
        <MessageSquare className='min-w-4 w-5 h-5' />
        <p className='hidden md:inline-block'>Comments</p>
      </NavLink>
      
      <NavLink className={linkClass} to='/admin/users'>
        <Users className='min-w-4 w-5 h-5' />
        <p className='hidden md:inline-block'>Users</p>
      </NavLink>
      
    </div>
  )
}

export default Sidebar
