import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Receipt } from '@mui/icons-material';
import api from '../services/api';
import OrderCard from '../components/OrderCard';
import { OrderCardSkeleton } from '../components/LoadingSkeleton';
import { useNotification } from '../context/NotificationContext';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const showNotification = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Your Orders
        </Typography>
        {Array.from({ length: 3 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3 }} fontWeight="bold">
        Your Orders
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Receipt sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start shopping to create your first order
          </Typography>
        </Box>
      ) : (
        <Box>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Box>
      )}
    </Container>
  );
}

export default Orders;