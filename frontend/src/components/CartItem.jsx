import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Box,
  Typography,
  TextField,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= (item.product?.stockQuantity || 100)) {
      onUpdateQuantity(item.product.id, newQuantity);
    }
  };

  // Get image path based on product name
  const getImagePath = (productName) => {
    if (!productName) return null;

    const imageMap = {
      'Monitor 27"': 'Monitor.png',
      'USB Hub': 'Usb Hub.png',
    };

    if (imageMap[productName]) {
      return `/Asset/Images/${imageMap[productName]}`;
    }

    return `/Asset/Images/${productName}.png`;
  };

  const imagePath = getImagePath(item.product?.name);

  return (
    <ListItem
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        mb: 2,
        backgroundColor: 'background.paper',
      }}
      secondaryAction={
        <IconButton
          edge="end"
          color="error"
          onClick={() => onRemove(item.product.id)}
        >
          <Delete />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Box
          sx={{
            width: 80,
            height: 80,
            mr: 2,
            borderRadius: 1,
            overflow: 'hidden',
            backgroundColor: 'grey.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={imagePath}
            alt={item.product?.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '8px',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<span style="font-size: 2rem; color: #9e9e9e;">${item.product?.name?.charAt(0) || 'P'}</span>`;
            }}
          />
        </Box>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="h6" component="div">
            {item.product?.name}
          </Typography>
        }
        secondary={
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {item.product?.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                ${item.product?.price?.toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <TextField
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  size="small"
                  sx={{ width: 70 }}
                  inputProps={{
                    min: 1,
                    max: item.product?.stockQuantity || 100,
                    style: { textAlign: 'center' },
                  }}
                />
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= (item.product?.stockQuantity || 100)}
                >
                  <Add />
                </IconButton>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                Subtotal: ${(item.product?.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};

export default CartItem;