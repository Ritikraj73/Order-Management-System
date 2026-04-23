import React, { useState, useEffect } from 'react'
import api from '../services/api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Your Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Order #{order.id}</h3>
                <span className={`status status-${order.status.toLowerCase()}`}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        background: order.status === 'PENDING' ? '#f39c12' : '#2ecc71',
                        color: 'white'
                      }}>
                  {order.status}
                </span>
              </div>
              <p><strong>Total:</strong> ${order.totalAmount}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

              <table style={{ marginTop: '15px' }}>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productId}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders