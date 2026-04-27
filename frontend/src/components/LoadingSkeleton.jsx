import React from 'react';
import { Skeleton, Card, CardContent, Box, Grid } from '@mui/material';

export const ProductCardSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={32} width="80%" />
      <Skeleton variant="text" height={20} width="100%" />
      <Skeleton variant="text" height={20} width="60%" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="text" height={28} width="30%" />
        <Skeleton variant="rectangular" height={24} width="25%" />
      </Box>
      <Skeleton variant="rectangular" height={36} width="100%" sx={{ mt: 2, borderRadius: 1 }} />
    </CardContent>
  </Card>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
        <ProductCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

export const OrderCardSkeleton = () => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Skeleton variant="text" height={32} width={150} />
          <Skeleton variant="text" height={20} width={200} />
        </Box>
        <Skeleton variant="rectangular" height={32} width={100} />
      </Box>
      <Skeleton variant="text" height={20} width="100%" />
      <Skeleton variant="text" height={20} width="80%" />
      <Skeleton variant="text" height={20} width="60%" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="text" height={28} width={80} />
        <Skeleton variant="text" height={28} width={100} />
      </Box>
    </CardContent>
  </Card>
);

export const CartItemSkeleton = () => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      p: 2,
      mb: 2,
      display: 'flex',
      gap: 2,
    }}
  >
    <Skeleton variant="rectangular" width={80} height={80} />
    <Box sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" height={32} width="60%" />
      <Skeleton variant="text" height={20} width="80%" />
      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Skeleton variant="text" height={24} width={80} />
        <Skeleton variant="rectangular" height={40} width={150} />
        <Skeleton variant="text" height={24} width={120} />
      </Box>
    </Box>
  </Box>
);