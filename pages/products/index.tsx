import React, { useEffect } from 'react';
import { Layout, Loading } from '@components/common';
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import { fetchAllProducts } from '@lib/public/products/productSlice';

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { productsList, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Layout>
      <Typography variant="h1" className="mb-6">Products</Typography>

      {loading && <Loading message="Loading products..." />}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && productsList.length === 0 && (
        <Typography color="text.secondary">No products found.</Typography>
      )}

      <Grid container spacing={3}>
        {productsList.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
            <Card className="h-full">
              {product.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="h3" className="mb-1">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary" className="mb-2">
                  {product.description?.substring(0, 100)}...
                </Typography>
                <Box className="flex justify-between items-center mt-3">
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    ${product.price}
                  </Typography>
                  {product.category && (
                    <Chip label={product.category.name} size="small" variant="outlined" />
                  )}
                </Box>
                {product.featured && (
                  <Chip label="Featured" size="small" color="warning" sx={{ mt: 1 }} />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
};

export default ProductsPage;
