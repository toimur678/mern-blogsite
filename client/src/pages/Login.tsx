import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowUpRight, Eye, EyeOff } from 'lucide-react'
import { errorMessage } from '../lib/format'
import '../reader.css'

const Login = () => {
  const [searchParams] = useSearchParams()
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { axios, setIsLoggedIn, setUserRole, setUserData, navigate, isLoggedIn, userRole, authLoading } = useAppContext()
  const requestedPath = searchParams.get('returnTo')
  const returnTo = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') && !requestedPath.includes('\\') && !requestedPath.startsWith('/login')
    ? requestedPath : null

  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate(returnTo || (userRole === 'admin' || userRole === 'editor' ? '/admin' : '/profile'), { replace: true })
  }, [authLoading, isLoggedIn, navigate, returnTo, userRole])

  const onSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return
    if (!isLogin && new TextEncoder().encode(password).length > 72) {
      setError('Choose a shorter password. Some characters use extra space.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(`/api/auth/${isLogin ? 'login' : 'signup'}`, { ...(isLogin ? {} : { name: name.trim() }), email: email.trim(), password })
      if (!data.success) throw new Error(data.message || 'Unable to sign in. Please try again.')
      setUserData(data.user)
      setUserRole(data.role)
      setIsLoggedIn(true)
      toast.success(isLogin ? 'Welcome back.' : 'Welcome to folio.')
      navigate(returnTo || (data.role === 'admin' || data.role === 'editor' ? '/admin' : '/profile'), { replace: true })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page" id="main-content">
      <aside className="auth-story">
        <Link to="/" className="auth-wordmark" aria-label="folio. home">folio<span>.</span></Link>
        <div className="auth-story-copy">
          <span className="reader-eyebrow">A little perspective goes a long way.</span>
          <h1>A quieter corner<br />of the internet.</h1>
          <p>Good stories. Fresh perspectives. A space for the endlessly curious.</p>
          <div className="auth-story-rule" />
          <span>Read thoughtfully. Stay curious.</span>
        </div>
        <p className="auth-story-foot">An independent journal for a considered life.</p>
      </aside>
      <section className="auth-panel">
        <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to the journal</Link>
        <div className="auth-form-wrap">
          <span className="reader-eyebrow">Your next chapter</span>
          <h2>{isLogin ? 'Good to see you again.' : 'Make yourself at home.'}</h2>
          <p className="auth-intro">{isLogin ? 'Sign in for your saved stories and the conversations you care about.' : 'Create your free account. Save what moves you and join the conversation.'}</p>
          <form onSubmit={onSubmitHandler} className="auth-form" aria-busy={loading}>
            {!isLogin && <div className="auth-field"><label htmlFor="auth-name">Your name</label><input id="auth-name" name="name" type="text" autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Alex Morgan" required minLength={2} maxLength={80} disabled={loading} /></div>}
            <div className="auth-field"><label htmlFor="auth-email">Email address</label><input id="auth-email" name="email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required maxLength={254} disabled={loading} /></div>
            <div className="auth-field"><label htmlFor="auth-password">Password</label><div className="auth-password"><input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} placeholder={isLogin ? 'Enter your password' : 'At least 8 characters'} required minLength={isLogin ? undefined : 8} maxLength={128} disabled={loading} aria-describedby={!isLogin ? 'auth-password-help' : undefined} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{!isLogin && <span className="auth-field-help" id="auth-password-help">Use at least 8 characters.</span>}</div>
            {error && <p className="reader-error" role="alert">{error}</p>}
            <button className="reader-primary auth-submit" type="submit" disabled={loading || authLoading}>{loading ? (isLogin ? 'Signing you in…' : 'Creating your account…') : (isLogin ? 'Sign in' : 'Create your account')}<ArrowUpRight size={18} /></button>
          </form>
          <p className="auth-switch">{isLogin ? 'New around here?' : 'Already part of the story?'} <button type="button" disabled={loading} onClick={() => { setIsLogin(value => !value); setError('') }}>{isLogin ? 'Create an account' : 'Sign in'}</button></p>
          <p className="auth-note">A free account for thoughtful reading. No noise, no rush.</p>
        </div>
        <span className="auth-panel-foot">A place for ideas worth your time.</span>
      </section>
    </main>
  )
}

export default Login
