import React, { useState, useEffect } from 'react'
import api from '../services/api'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [page])

  const fetchProducts = async () => {
    try {
      const response = await api.get(`/products?page=${page}&size=10`)
      setProducts(response.data.content)
      setTotalPages(response.data.totalPages)
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id)
    let newCart
    if (existing) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={() => window.location.href = '/cart'}>
          Cart ({cart.length})
        </button>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="price">${product.price}</div>
            <p><small>Category: {product.category}</small></p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{ marginRight: '10px' }}
        >
          Previous
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button
          className="btn btn-primary"
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages - 1}
          style={{ marginLeft: '10px' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Products