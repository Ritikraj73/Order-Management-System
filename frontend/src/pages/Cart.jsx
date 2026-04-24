import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ))
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
  }

  const placeOrder = async () => {
    setPlacing(true)
    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))

      await api.post('/orders', { items: orderItems })

      setCart([])
      localStorage.removeItem('cart')
      alert('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      alert('Failed to place order: ' + (err.response?.data?.message || err.message))
    } finally {
      setPlacing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2>Shopping Cart</h2>

      <div>
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div>
              <h4>{item.name}</h4>
              <p>${item.price} each</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              <button onClick={() => removeFromCart(item.id)} className="btn btn-danger">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-total">
        Total: ${getTotal()}
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <button
          className="btn btn-success"
          style={{ padding: '15px 30px', fontSize: '18px' }}
          onClick={placeOrder}
          disabled={placing}
        >
          {placing ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  )
}

export default Cart