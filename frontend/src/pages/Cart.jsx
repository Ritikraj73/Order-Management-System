import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Button,
  Paper,
  Divider,
  Container,
} from '@mui/material';
import { ShoppingBag, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CartItem from '../components/CartItem';
import { CartItemSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNotification } from '../context/NotificationContext';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const showNotification = useNotification();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    showNotification('Item removed from cart', 'info');
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const handlePlaceOrderClick = () => {
    setConfirmDialogOpen(true);
  };

  const placeOrder = async () => {
    setConfirmDialogOpen(false);
    setPlacing(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      await api.post('/orders', { items: orderItems });

      setCart([]);
      localStorage.removeItem('cart');
      showNotification('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      showNotification(`Failed to place order: ${message}`, 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Shopping Cart
        </Typography>
        {Array.from({ length: 3 }).map((_, i) => (
          <CartItemSkeleton key={i} />
        ))}
      </Container>
    );
  }

  if (cart.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <ShoppingBag sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add some products to get started
        </Typography>
        <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3 }} fontWeight="bold">
        Shopping Cart
      </Typography>

      <List sx={{ mb: 3 }}>
        {cart.map((item) => (
          <CartItem
            key={item.id}
            item={{ product: item, quantity: item.quantity }}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />
        ))}
      </List>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Subtotal:</Typography>
          <Typography variant="h6" fontWeight="medium">
            ${getTotal()}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Total:
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight="bold">
            ${getTotal()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            fullWidth
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            onClick={handlePlaceOrderClick}
            disabled={placing}
            fullWidth
            size="large"
          >
            {placing ? 'Placing Order...' : 'Place Order'}
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Confirm Order"
        message={`Are you sure you want to place this order for $${getTotal()}?`}
        onConfirm={placeOrder}
        onCancel={() => setConfirmDialogOpen(false)}
      />
    </Container>
  );
}

export default Cart;