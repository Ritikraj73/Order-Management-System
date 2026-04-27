import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { CheckCircle, AccessTime, LocalShipping } from '@mui/icons-material';

const getStatusIcon = (status) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle />;
    case 'SHIPPED':
      return <LocalShipping />;
    default:
      return <AccessTime />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'SHIPPED':
      return 'info';
    case 'PROCESSING':
      return 'warning';
    default:
      return 'default';
  }
};

const OrderCard = ({ order }) => {
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

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Order #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
          <Chip
            label={order.status}
            color={getStatusColor(order.status)}
            icon={getStatusIcon(order.status)}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Order Items:
        </Typography>
        <List dense>
          {order.items?.map((item, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    mr: 1,
                    borderRadius: 1,
                    overflow: 'hidden',
                    backgroundColor: 'grey.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={getImagePath(item.productName)}
                    alt={item.productName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '4px',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span style="font-size: 1.5rem; color: #9e9e9e;">${item.productName?.charAt(0) || 'P'}</span>`;
                    }}
                  />
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={item.productName || `Product #${item.productId}`}
                secondary={`Quantity: ${item.quantity} × $${item.price?.toFixed(2)}`}
              />
              <Typography variant="body2" fontWeight="medium">
                ${(item.quantity * item.price).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            ${order.totalAmount?.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderCard;