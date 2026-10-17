import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, ShieldCheck } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { CmsEmpty, CmsError, CmsLoading, CmsPageHeading, CmsPagination } from '../../components/admin/CmsUI'
import { errorMessage, formatDate } from '../../lib/format'
import toast from 'react-hot-toast'

interface CommunityUser { _id: string; name: string; email: string; role: 'user' | 'editor' | 'admin'; isActive?: boolean; createdAt: string; comments: { _id: string; content: string; createdAt: string }[] }
const Users = () => {
  const { axios, userRole, userData } = useAppContext()
  const [users, setUsers] = useState<CommunityUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const requestVersion = useRef(0)
  const [busyId, setBusyId] = useState('')
  const [expandedId, setExpandedId] = useState('')
  const fetchUsers = useCallback(async () => {
    if (userRole !== 'admin') { setLoading(false); return }
    const version = ++requestVersion.current
    setLoading(true); setError('')
    try { const { data } = await axios.get('/api/admin/users', { params: { page, limit: 10, search, role: role === 'all' ? undefined : role } }); if (version !== requestVersion.current) return; if (!data.success) throw new Error(data.message); setUsers(data.users || []); setTotal(data.pagination?.total ?? data.users.length); if (data.pagination?.pages && page > data.pagination.pages) setPage(data.pagination.pages) } catch (err) { if (version === requestVersion.current) setError(errorMessage(err)) } finally { if (version === requestVersion.current) setLoading(false) }
  }, [axios, page, search, role, userRole])
  useEffect(() => { void fetchUsers(); return () => { requestVersion.current += 1 } }, [fetchUsers])
  useEffect(() => { const timer = window.setTimeout(() => { setSearch(query); setPage(1) }, 250); return () => window.clearTimeout(timer) }, [query])
  const updateUser = async (user: CommunityUser, changes: { role?: string; isActive?: boolean }) => {
    if (changes.role && !window.confirm(`Change ${user.name}’s role to ${changes.role}? ${changes.role === 'admin' ? 'Administrators can manage all content and community members.' : changes.role === 'editor' ? 'Editors can create and publish articles.' : 'Readers can comment and manage their own profile.'}`)) return
    if (changes.isActive === false && !window.confirm(`Suspend ${user.name}’s account? They will not be able to sign in until restored.`)) return
    setBusyId(user._id)
    try { const { data } = await axios.patch(`/api/admin/users/${user._id}`, changes); if (!data.success) throw new Error(data.message); toast.success(data.message || 'Member updated'); await fetchUsers() } catch (err) { toast.error(errorMessage(err)) } finally { setBusyId('') }
  }
  if (userRole !== 'admin') return <section className="cms-page"><CmsEmpty title="An administrator’s workspace." description="Community roles and account access are managed by your publication’s administrators." /></section>
  return <section className="cms-page"><CmsPageHeading title="The people behind the pages." description="Know your readers, support your writers, and keep your community in good hands." />
    <div className="cms-role-note"><ShieldCheck size={20} /><p><strong>A considered community.</strong> Readers join the conversation. Editors create and publish. Administrators manage the whole publication.</p></div>
    <div className="cms-list-panel"><div className="cms-list-toolbar"><label className="cms-search"><Search size={17} /><input aria-label="Search community members" placeholder="Search by name or email…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="cms-filter"><select aria-label="Filter by role" value={role} onChange={event => { setRole(event.target.value); setPage(1) }}><option value="all">All roles</option><option value="user">Readers</option><option value="editor">Editors</option><option value="admin">Administrators</option></select></label></div>
    {error && <CmsError message={error} retry={() => void fetchUsers()} />}{loading ? <CmsLoading label="Loading your community…" /> : users.length ? <><div className="cms-table-scroll"><table className="cms-table cms-users-table"><thead><tr><th scope="col">Member</th><th scope="col">Joined</th><th scope="col">Comments</th><th scope="col">Role</th><th scope="col">Account</th></tr></thead><tbody>{users.map(user => <tr key={user._id}><td><div className="cms-member"><span className="cms-avatar">{user.name?.charAt(0).toUpperCase() || 'R'}</span><div><strong>{user.name}</strong><span>{user.email}</span></div>{userData?.id === user._id && <span className="cms-you-badge">You</span>}</div>{expandedId === user._id && <div className="cms-member-comments">{user.comments?.length ? user.comments.map(comment => <div key={comment._id}><p>{comment.content}</p><small>{formatDate(comment.createdAt)}</small></div>) : <p>No comments yet.</p>}</div>}</td><td className="cms-date-cell">{formatDate(user.createdAt)}</td><td><button className="cms-text-button cms-comments-toggle" aria-expanded={expandedId === user._id} onClick={() => setExpandedId(expandedId === user._id ? '' : user._id)}>{user.comments?.length || 0}<ChevronDown size={13} /></button></td><td><select className="cms-role-select" aria-label={`Role for ${user.name}`} value={user.role || 'user'} disabled={busyId === user._id || userData?.id === user._id} onChange={event => void updateUser(user, { role: event.target.value })}><option value="user">Reader</option><option value="editor">Editor</option><option value="admin">Admin</option></select></td><td><div className="cms-account-control"><span className={`cms-status${user.isActive !== false ? ' cms-status-published' : ''}`}><i />{user.isActive === false ? 'Suspended' : 'Active'}</span>{userData?.id !== user._id && <button className="cms-text-button" disabled={busyId === user._id} onClick={() => void updateUser(user, { isActive: user.isActive === false })}>{user.isActive === false ? 'Restore' : 'Suspend'}</button>}</div></td></tr>)}</tbody></table></div><CmsPagination page={page} total={total} pageSize={10} onChange={setPage} /></> : !error && <CmsEmpty title={search ? 'No members found' : 'A community in the making.'} description={search ? 'Try another name, email, or role.' : 'New readers and writers will appear here as they join.'} />}</div>
  </section>
}
export default Users
