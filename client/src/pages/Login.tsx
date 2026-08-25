import { useState, FormEvent } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { axios, setIsLoggedIn, setUserRole, setUserData, navigate } = useAppContext()

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { data } = await axios.post('/api/auth/login', { email, password })
        if (data.success) {
          setIsLoggedIn(true)
          setUserRole(data.role)
          setUserData(data.user)
          toast.success('Logged in successfully')
          if (data.role === 'admin' || data.role === 'editor') {
            navigate('/admin')
          } else {
            navigate('/')
          }
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post('/api/auth/signup', { name, email, password })
        if (data.success) {
          setIsLoggedIn(true)
          setUserRole(data.role)
          setUserData(data.user)
          toast.success('Account created successfully')
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-surface-teal px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden'>
        <div className='p-8'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-heading font-bold text-navy mb-2'>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className='text-navy/60'>
              {isLogin 
                ? 'Enter your credentials to access your account.' 
                : 'Sign up to start sharing and exploring ideas.'}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-5'>
            {!isLogin && (
              <div>
                <label className='block text-sm font-medium text-navy mb-1'>Full Name</label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
                  placeholder='John Doe'
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className='block text-sm font-medium text-navy mb-1'>Email Address</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
                placeholder='you@example.com'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-navy mb-1'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
                  placeholder='••••••••'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy transition-colors'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 mt-4'
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-navy/60'>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className='text-primary font-medium hover:underline focus:outline-none'
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
        
        <div className='bg-surface-input px-8 py-4 text-center border-t border-border'>
          <p className='text-sm text-navy/50'>
            <button onClick={() => navigate('/')} className='hover:text-primary transition-colors'>
              ← Back to Home
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
