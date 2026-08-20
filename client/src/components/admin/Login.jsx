import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

  const {axios, setToken} = useAppContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        const { data } = await axios.post('/api/admin/login', {email, password})

        if(data.success) {
          setToken(data.token)
          localStorage.setItem('token', data.token)
          axios.defaults.headers.common['Authorization'] = data.token
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
  }
   
  return (
    <div className='flex items-center justify-center min-h-screen bg-surface-teal/30'>
      <div className='w-full max-w-md p-8 mx-6 bg-surface rounded-[20px] shadow-card-hover'>
        <div className='text-center mb-8'>
          <h1 className='font-heading text-3xl font-bold text-navy mb-2'>
            Tech<span className='text-primary'>Everyday</span>
          </h1>
          <p className='text-sm text-[#333]/60'>Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-navy'>Email</label>
            <input 
              onChange={(e) => setEmail(e.target.value)} 
              value={email} 
              className='w-full h-[44px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-4 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
              type="email" 
              required 
              placeholder='admin@techeveryday.com'
            />
          </div>
          
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-navy'>Password</label>
            <input 
              onChange={(e) => setPassword(e.target.value)} 
              value={password} 
              className='w-full h-[44px] bg-surface-input text-navy placeholder:text-navy/50 rounded-[10px] px-4 text-base outline-none focus:bg-surface focus:ring-2 focus:ring-primary transition-all' 
              type="password" 
              required 
              placeholder='Enter your password'
            />
          </div>

          <button 
            className='w-full h-[48px] bg-primary text-white font-semibold text-base rounded-lg cursor-pointer hover:bg-primary-dark transition-all mt-2' 
            type='submit'
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
