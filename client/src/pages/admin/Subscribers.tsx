import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, LoaderCircle, Mail, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { CmsEmpty, CmsError, CmsLoading, CmsPageHeading, CmsPagination } from '../../components/admin/CmsUI'
import { useAppContext } from '../../context/AppContext'
import { errorMessage, formatDate } from '../../lib/format'

interface Subscriber { _id: string; email: string; createdAt: string; isActive: boolean }

function csvField(value: string): string {
  // Keep reader-supplied values as text when the file opens in a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

const Subscribers = () => {
  const { axios, userRole } = useAppContext()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [confirmId, setConfirmId] = useState('')
  const [busyId, setBusyId] = useState('')
  const requestVersion = useRef(0)
  const fetchSubscribers = useCallback(async () => {
    if (userRole !== 'admin') { setLoading(false); return }
    const version = ++requestVersion.current
    setLoading(true); setError('')
    try {
      const { data } = await axios.get('/api/admin/subscribers', { params: { page, limit: 15 } })
      if (version !== requestVersion.current) return
      if (!data.success) throw new Error(data.message || 'Unable to load subscribers.')
      setSubscribers(data.subscribers || []); setTotal(data.pagination?.total ?? data.subscribers.length)
      const pages = Math.max(1, data.pagination?.pages || 1)
      if (page > pages) setPage(pages)
    } catch (err) { if (version === requestVersion.current) setError(errorMessage(err)) }
    finally { if (version === requestVersion.current) setLoading(false) }
  }, [axios, page, userRole])
  useEffect(() => { void fetchSubscribers(); return () => { requestVersion.current += 1 } }, [fetchSubscribers])
  const unsubscribe = async (subscriber: Subscriber) => {
    setBusyId(subscriber._id)
    try {
      const { data } = await axios.patch(`/api/admin/subscribers/${subscriber._id}`, { isActive: false })
      if (!data.success) throw new Error(data.message || 'Unable to unsubscribe this reader.')
      setConfirmId(''); toast.success('Reader unsubscribed'); await fetchSubscribers()
    } catch (err) { toast.error(errorMessage(err)) }
    finally { setBusyId('') }
  }
  const exportPage = () => {
    const rows = [['Email', 'Subscribed on'], ...subscribers.map(subscriber => [subscriber.email, subscriber.createdAt])]
    const csv = '\uFEFF' + rows.map(row => row.map(csvField).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url; link.download = `folio-subscribers-page-${page}.csv`
    document.body.appendChild(link); link.click(); link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }
  if (userRole !== 'admin') return <section className="cms-page"><CmsEmpty title="An administrator’s workspace." description="Your publication’s administrators manage newsletter subscribers." /></section>
  return <section className="cms-page">
    <CmsPageHeading title="Readers who stay close." description="The people who invited a little folio. into their inbox."><button type="button" disabled={loading || !subscribers.length || Boolean(error)} className="cms-button cms-button-secondary" onClick={exportPage}><Download size={16} />Export this page</button></CmsPageHeading>
    <div className="cms-role-note"><Mail size={20} /><p><strong>A thoughtful letter, a willing audience.</strong> Only active subscribers are shown. CSV exports include the current page.</p></div>
    <div className="cms-list-panel"><div className="cms-list-toolbar"><h2 className="cms-subscribers-title">Newsletter subscribers</h2><span className="cms-result-label">{total.toLocaleString()} active {total === 1 ? 'reader' : 'readers'}</span></div>
      {error && <CmsError message={error} retry={() => void fetchSubscribers()} />}
      {loading ? <CmsLoading label="Loading subscribers…" /> : subscribers.length ? <><div className="cms-table-scroll"><table className="cms-table cms-subscribers-table"><thead><tr><th scope="col">Email address</th><th scope="col">Subscribed</th><th scope="col">Manage subscription</th></tr></thead><tbody>{subscribers.map(subscriber => <tr key={subscriber._id}><td><div className="cms-subscriber"><span className="cms-avatar"><Mail size={15} /></span><span>{subscriber.email}</span></div></td><td className="cms-date-cell">{formatDate(subscriber.createdAt)}</td><td>{confirmId === subscriber._id ? <div className="cms-unsubscribe-confirm"><span>Unsubscribe this reader?</span><div><button type="button" disabled={busyId === subscriber._id} className="cms-button cms-button-secondary cms-small-button cms-unsubscribe-action" onClick={() => void unsubscribe(subscriber)}>{busyId === subscriber._id ? <LoaderCircle size={13} className="cms-spin" /> : <UserMinus size={13} />}Confirm</button><button type="button" disabled={busyId === subscriber._id} className="cms-text-button" onClick={() => setConfirmId('')}>Cancel</button></div></div> : <button type="button" className="cms-text-button" onClick={() => setConfirmId(subscriber._id)}><UserMinus size={13} />Unsubscribe</button>}</td></tr>)}</tbody></table></div><CmsPagination page={page} total={total} pageSize={15} onChange={nextPage => { setPage(nextPage); setConfirmId('') }} /></> : !error && <CmsEmpty title="A letter needs its first reader." description="Newsletter subscribers will appear here when readers sign up from your publication." />}
    </div>
  </section>
}
export default Subscribers
