import { useState, type FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { errorMessage } from '../lib/format'

const Newsletter = () => {
  const { axios, demoMode } = useAppContext()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const subscribe = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (demoMode) { setError('Subscriptions are unavailable in this sample edition. Your email has not been saved.'); return }
    setBusy(true)
    try {
      const { data } = await axios.post('/api/newsletter/subscribe', { email: email.trim() })
      if (!data.success) throw new Error(data.message)
      setSuccess(true)
    } catch (failure) { setError(errorMessage(failure)) } finally { setBusy(false) }
  }
  return <section className='site-container newsletter-section' id='newsletter'>
    <div className='newsletter-inner'>
      <div className='newsletter-copy'>
        <p className='eyebrow'>THE FOLIO LETTER</p>
        <h2>Subscribe to our newsletter and<br/><em>stay updated each week</em></h2>
        <p>Regular updates ensure that readers have access to fresh perspectives — a quieter corner of your inbox.</p>
      </div>
      <div className='newsletter-signup'>
        {success ? <div className='newsletter-success' role='status'><span><Check size={22}/></span><h3>You're on the list.</h3><p>Thanks for making room for a little perspective.</p></div> : <form onSubmit={subscribe}><label className='sr-only' htmlFor='newsletter-email'>Your email address</label><div className='newsletter-input-row'><input id='newsletter-email' type='email' autoComplete='email' value={email} onChange={event => setEmail(event.target.value)} required placeholder='Email address' maxLength={254} aria-describedby='newsletter-note newsletter-error'/><button className='button button-dark' disabled={busy}>{busy ? 'Joining…' : 'Submit now'} <ArrowRight size={15}/></button></div><p id='newsletter-note' className='newsletter-note'>Good reads. No noise. Unsubscribe whenever you like.</p>{error && <p id='newsletter-error' className='form-error' role='alert'>{error}</p>}</form>}
      </div>
    </div>
  </section>
}
export default Newsletter

