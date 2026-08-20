import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const { axios, setToken, navigate } = useAppContext()

  const logout = () => {
    localStorage.removeItem('token')
    axios.defaults.headers.common['Authorization'] = 'null'
    setToken(null)
    navigate('/')
  }


  return (
    <>
      {/* Admin Header */}
      <div className='flex items-center justify-between h-[70px] px-4 sm:px-12 border-b border-border bg-surface'>
        <h1 
          onClick={() => navigate('/')} 
          className='font-heading text-xl font-bold text-navy cursor-pointer select-none'
        >
          Tech<span className='text-primary'>Everyday</span>
        </h1>
        <button 
          onClick={logout} 
          className='text-sm px-6 py-2.5 bg-primary text-white font-semibold rounded-lg cursor-pointer hover:bg-primary-dark transition-colors'
        >
          Logout
        </button>
      </div>

      <div className='flex h-[calc(100vh-70px)]'>
        <Sidebar/>
        <Outlet/>
      </div>
    </>
  )
}

export default Layout
