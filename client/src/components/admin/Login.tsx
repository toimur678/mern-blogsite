import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useAppContext, type UserRole } from '../../context/AppContext'
import { errorMessage } from '../../lib/format'
import '../../admin.css'

const Login = () => {
  const { axios, setIsLoggedIn, setUserRole, setUserData } = useAppContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await axios.post('/api/admin/login', { email: email.trim(), password })
      if (!data.success) throw new Error(data.message || 'Unable to sign in.')
      setUserRole(data.role as UserRole); setUserData(data.user || null); setIsLoggedIn(true)
    } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) }
  }
  return <div className="cms-login"><aside className="cms-login-story"><Link to="/" className="cms-wordmark">folio<span>.</span></Link><div><span className="cms-eyebrow">The editorial studio</span><h1>A space for<br />your next<br /><em>great story.</em></h1><p>Thoughtful words. Fresh perspectives.<br />A publication that feels like you.</p></div><span className="cms-login-footnote">Independent minds. Shared ideas.</span></aside><main id="main-content" className="cms-login-main"><Link to="/" className="cms-login-back"><ArrowLeft size={15} />Back to publication</Link><div className="cms-login-form-wrap"><span className="cms-eyebrow">Welcome to your workspace</span><h2>Good to have you here.</h2><p>Sign in to write, edit, and make something worth reading.</p><form onSubmit={handleSubmit} className="cms-login-form">{error && <p role="alert" className="cms-inline-error">{error}</p>}<label className="cms-field" htmlFor="studio-email"><span>Email address</span><input id="studio-email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@publication.com" required /></label><label className="cms-field" htmlFor="studio-password"><span>Password</span><div className="cms-password-field"><input id="studio-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Your password" required /><button type="button" className="cms-icon-button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><button type="submit" disabled={loading} className="cms-button cms-button-primary">{loading ? <><LoaderCircle size={17} className="cms-spin" />Signing in…</> : <>Enter the studio<ArrowRight size={17} /></>}</button></form><p className="cms-login-hint">For publication administrators and editors.<br />Here to read? <Link to="/login">Sign in as a reader.</Link></p></div><span className="cms-login-copyright">folio. — A little perspective goes a long way.</span></main></div>
}
export default Login
