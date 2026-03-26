import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Minus, Plus, AlertCircle, ArrowLeft, Box } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { productService } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { ProductDetailsPageResponse } from '../types';
import toast from 'react-hot-toast';

export const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetailsPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    productService
      .getBySlug(slug)
      .then(setProduct)
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addItem(
        product.productId,
        product.productName,
        product.productImageUrl,
        product.sellingPrice,
        quantity
      );
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-[#F5F5F5] dark:bg-zinc-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-[#F5F5F5] dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-10 bg-[#F5F5F5] dark:bg-zinc-800 rounded w-2/3" />
            <div className="h-20 bg-[#F5F5F5] dark:bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#666666] hover:text-accent-dark transition-colors mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to fragrances
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-[3/4] overflow-hidden rounded-3xl bg-[#F5F5F5] dark:bg-zinc-900"
        >
          {product.productImageUrl ? (
            <img
              src={product.productImageUrl}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
              <Box className="h-16 w-16 opacity-30 mb-4" />
              <span className="text-sm font-medium uppercase tracking-widest opacity-50">No Image Available</span>
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center space-y-6"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#999999] mb-2">
              {product.category}
            </p>
            <h1 className="text-4xl font-serif font-bold dark:text-white mb-3">
              {product.productName}
            </h1>
            <p className="text-[#666666] dark:text-zinc-400 leading-relaxed">
              {product.productShortDescription}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold dark:text-white">
              {product.sellingPrice}
            </span>
            {product.isOutOfStock && (
              <Badge variant="default">Out of Stock</Badge>
            )}
            {product.isFeatured && !product.isOutOfStock && (
              <Badge variant="success">Featured</Badge>
            )}
          </div>

          {/* Full description */}
          <p className="text-sm text-[#666666] dark:text-zinc-400 leading-relaxed border-t border-[#F5F5F5] dark:border-zinc-800 pt-6">
            {product.productDescription}
          </p>

          {/* Out of stock warning */}
          {product.isOutOfStock && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              This product is currently out of stock.
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {!product.isOutOfStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999]">Quantity</p>
                <div className="flex items-center gap-3 bg-[#F5F5F5] dark:bg-zinc-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                isLoading={isAdding}
                className="w-full h-14 rounded-2xl text-base"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
