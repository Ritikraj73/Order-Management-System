import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { ShoppingCart, CheckCircle, Cancel } from '@mui/icons-material';

const ProductCard = ({ product, onAddToCart, showAddToCart = true }) => {
  // Determine stock status - if stockQuantity exists and > 0, or if inStock is explicitly true
  const stockQuantity = product.stockQuantity ?? 100; // Default to 100 if not provided
  const isInStock = product.inStock !== undefined ? product.inStock : stockQuantity > 0;

  // Get image path based on product name
  const getImagePath = (productName) => {
    if (!productName) return null;

    // Custom mapping for products with different names
    const imageMap = {
      'Monitor 27"': 'Monitor 27.png',
      'USB Hub': 'USB Hub.png',
    };

    // Check if there's a custom mapping
    if (imageMap[productName]) {
      return `/Asset/Images/${imageMap[productName]}`;
    }

    // Try exact match
    return `/Asset/Images/${productName}.png`;
  };

  const imagePath = getImagePath(product.name);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="img"
        image={imagePath}
        alt={product.name}
        sx={{
          height: 200,
          objectFit: 'contain',
          backgroundColor: 'grey.50',
          p: 2,
        }}
        onError={(e) => {
          // Fallback to placeholder if image not found
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
            <div style="height: 200px; display: flex; align-items: center; justify-content: center; background-color: #f5f5f5;">
              <span style="font-size: 4rem; color: #9e9e9e;">${product.name?.charAt(0) || 'P'}</span>
            </div>
          `;
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            ${product.price?.toFixed(2)}
          </Typography>
          <Chip
            label={isInStock ? 'In Stock' : 'Out of Stock'}
            color={isInStock ? 'success' : 'error'}
            size="small"
            icon={isInStock ? <CheckCircle /> : <Cancel />}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Stock: {stockQuantity} units
        </Typography>
      </CardContent>
      {showAddToCart && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => onAddToCart(product)}
            disabled={!isInStock}
          >
            Add to Cart
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProductCard;