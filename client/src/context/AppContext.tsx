import { createContext, useContext, useEffect, useState, ReactNode } from "react" 
import axios from 'axios'
import { useNavigate, NavigateFunction } from 'react-router-dom'
import toast from "react-hot-toast"
import { BlogData } from "../assets/assets"

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
axios.defaults.withCredentials = true

export type UserRole = 'admin' | 'editor' | null

interface AppContextType {
    axios: typeof axios
    navigate: NavigateFunction
    isLoggedIn: boolean
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
    userRole: UserRole
    setUserRole: React.Dispatch<React.SetStateAction<UserRole>>
    blogs: BlogData[]
    setBlogs: React.Dispatch<React.SetStateAction<BlogData[]>>
    input: string
    setInput: React.Dispatch<React.SetStateAction<string>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
    children: ReactNode
}

export const AppProvider = ({children}: AppProviderProps) => {

    const navigate = useNavigate()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [userRole, setUserRole] = useState<UserRole>(null)
    const [blogs, setBlogs] = useState<BlogData[]>([])
    const [input, setInput] = useState<string>("")

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get('/api/blog/all')
            data.success ? setBlogs(data.blogs) : toast.error(data.message)
        } catch (error) {
            toast.error((error as Error).message)
        }
    }

    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/admin/check-auth')
            if (data.success) {
                setIsLoggedIn(true)
                setUserRole(data.role)
            }
        } catch {
            // Not authenticated — silently ignore
        }
    }

    useEffect(() => {
        fetchBlogs()
        checkAuth()
    }, [])

    const value: AppContextType = {axios, navigate, isLoggedIn, setIsLoggedIn, userRole, setUserRole, blogs, setBlogs, input, setInput}
    
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}
