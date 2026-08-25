import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const { navigate, userRole, logout } = useAppContext()

  return (
    <>
      {/* Admin Header */}
      <div className='flex items-center justify-between h-[70px] px-4 sm:px-12 border-b border-border bg-surface'>
        <h1 
          onClick={() => navigate('/')} 
          className='font-heading text-xl font-bold text-navy cursor-pointer select-none'
        >
          LittleTech<span className='text-primary'>Tips</span>
        </h1>
        <div className='flex items-center gap-4'>
          {userRole && (
            <span className={`text-xs font-semibold uppercase px-3 py-1.5 rounded-md ${
              userRole === 'admin' 
                ? 'bg-surface-teal text-primary' 
                : 'bg-surface-peach text-accent'
            }`}>
              {userRole}
            </span>
          )}
          <button 
            onClick={logout} 
            className='text-sm px-6 py-2.5 bg-primary text-white font-semibold rounded-lg cursor-pointer hover:bg-primary-dark transition-colors'
          >
            Logout
          </button>
        </div>
      </div>

      <div className='flex h-[calc(100vh-70px)]'>
        <Sidebar/>
        <Outlet/>
      </div>
    </>
  )
}

export default Layout
