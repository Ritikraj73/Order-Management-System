import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    const { token, username: userName, role } = response.data

    localStorage.setItem('token', token)
    const userData = { username: userName, role }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    return response.data
  }

  const register = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password })
    const { token, username: userName, role } = response.data

    localStorage.setItem('token', token)
    const userData = { username: userName, role }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    return response.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}