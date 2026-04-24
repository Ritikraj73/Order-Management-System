import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import AdminProducts from './pages/AdminProducts'
import Cart from './pages/Cart'
import Orders from './pages/Orders'

function PrivateRoute({ children, roles = [] }) {
  const { user, loading } = useAuth()

  if (loading){
  return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Products />} />
          <Route path="/cart" element={
            <PrivateRoute><Cart /></PrivateRoute>
          } />
          <Route path="/orders" element={
            <PrivateRoute><Orders /></PrivateRoute>
          } />
          <Route path="/admin/products" element={
            <PrivateRoute roles={['ADMIN']}><AdminProducts /></PrivateRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  )
}

function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1>OMS</h1>
          <nav className="nav-links">
            <Link to="/">Products</Link>
            {user && <Link to="/cart">Cart</Link>}
            {user && <Link to="/orders">Orders</Link>}
            {user?.role === 'ADMIN' && <Link to="/admin/products">Admin</Link>}
          </nav>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <span>Welcome, {user.username}</span>
              <button onClick={logout} className="btn btn-danger">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  )
}

export default App