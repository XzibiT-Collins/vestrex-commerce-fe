import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Box } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Modal';
import { productService } from '../services/productService';
import type { ProductDetails, ConversionResponse } from '../types';
import toast from 'react-hot-toast';

export const AdminProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Conversion State
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [conversionTab, setConversionTab] = useState<'FORWARD' | 'REVERSE'>('FORWARD');
  const [conversionQuantity, setConversionQuantity] = useState('');
  const [targetProductId, setTargetProductId] = useState('');
  const [families, setFamilies] = useState<any[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSummary, setConversionSummary] = useState<ConversionResponse | null>(null);

  const loadProduct = () => {
    if (!productId) return;
    setIsLoading(true);
    productService
      .getById(Number(productId))
      .then(setProduct)
      .catch(() => {
        toast.error('Product not found');
        navigate('/admin/products', { replace: true });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (isConversionModalOpen && conversionTab === 'REVERSE' && families.length === 0) {
      productService.getFamilies().then(setFamilies).catch(() => {});
    }
  }, [isConversionModalOpen, conversionTab]);

  const handleConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsConverting(true);
    setConversionSummary(null);

    try {
      if (conversionTab === 'FORWARD') {
        const res = await productService.forwardConversion({ 
          sourceProductId: product.productId, 
          quantity: Number(conversionQuantity) 
        });
        setConversionSummary(res);
        toast.success('Forward conversion completed successfully');
      } else {
        const res = await productService.reverseConversion({
          sourceProductId: product.productId,
          targetProductId: Number(targetProductId),
          quantity: Number(conversionQuantity)
        });
        setConversionSummary(res);
        toast.success('Reverse conversion completed successfully');
      }
      loadProduct(); // refresh admin details to show new stock
    } catch (err: any) {
      toast.error(err?.response?.data?.description || 'Conversion failed. Please check rules.');
    } finally {
      setIsConverting(false);
    }
  };

  const renderConversionModal = () => (
    <Modal isOpen={isConversionModalOpen} onClose={() => { setIsConversionModalOpen(false); setConversionSummary(null); }} title="Stock Conversion">
      {conversionSummary ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-xl">
            <h3 className="font-bold mb-2">Conversion Successful</h3>
            <p className="text-sm">From: <strong>{conversionSummary.fromProductName}</strong></p>
            <p className="text-sm">To: <strong>{conversionSummary.toProductName}</strong></p>
            <p className="text-sm">Quantity Used: <strong>{conversionSummary.fromQuantity}</strong></p>
            <p className="text-sm">Quantity Added: <strong>{conversionSummary.toQuantity}</strong></p>
            <p className="text-sm">Variance: <strong>{conversionSummary.varianceAmount}</strong></p>
          </div>
          <Button onClick={() => setConversionSummary(null)} className="w-full h-12 rounded-2xl">
            Do Another Conversion
          </Button>
        </div>
      ) : (
        <form onSubmit={handleConversion} className="space-y-6">
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${conversionTab === 'FORWARD' ? 'bg-white dark:bg-zinc-700 shadow text-accent-dark' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              onClick={() => { setConversionTab('FORWARD'); setConversionSummary(null); }}
            >
              Forward (Bulk to Base)
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${conversionTab === 'REVERSE' ? 'bg-white dark:bg-zinc-700 shadow text-accent-dark' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              onClick={() => { setConversionTab('REVERSE'); setConversionSummary(null); }}
            >
              Reverse (Base to Bulk)
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl space-y-4 border border-gray-100 dark:border-zinc-700">
            {conversionTab === 'REVERSE' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                  Target Variant SKU
                </label>
                <Dropdown
                  value={targetProductId}
                  onChange={(val) => setTargetProductId(val)}
                  options={[
                    { label: 'Select Target Variant...', value: '' },
                    ...families.flatMap(f => (f.variants || f.products || []).filter((v: any) => v.productId !== product?.productId).map((v: any) => ({
                      label: `${v.productName || v.sku || v.stockKeepingUnit} (${v.uomCode || v.uom})`,
                      value: String(v.productId)
                    })))
                  ]}
                />
                <p className="text-xs text-gray-500 mt-2">Target must be a variant in the same family as this base unit.</p>
              </div>
            )}
            
            <Input 
              label={conversionTab === 'FORWARD' ? "Source Quantity to Convert (Bulk)" : "Source Quantity to Convert (Base EA)"}
              type="number" 
              value={conversionQuantity}
              onChange={(e) => setConversionQuantity(e.target.value)} 
              required 
              min="1"
            />
          </div>

          <Button type="submit" isLoading={isConverting} className="w-full h-12 rounded-2xl">
            Execute Conversion
          </Button>
        </form>
      )}
    </Modal>
  );

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border border-zinc-200 dark:border-zinc-800 rounded-3xl h-96"></div>
          <div className="lg:col-span-2 space-y-4">
             <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
             <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
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
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#666666] dark:text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Product Details</h1>
          <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">Manage product information and stock conversions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image and Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#F5F5F5] dark:bg-zinc-800 mb-6">
              {product.productImageUrl ? (
                <img
                  src={product.productImageUrl}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Box className="h-12 w-12 opacity-50" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Status</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={product.isActive ? "success" : "default"}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {product.isFeatured && <Badge variant="info">Featured</Badge>}
                  {product.isOutOfStock && <Badge variant="danger">Out of Stock</Badge>}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Category</p>
                <p className="text-sm font-medium dark:text-white">{product.category?.categoryName || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details and admin Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">{product.productName}</h2>
                <p className="text-[#666666] dark:text-zinc-400">{product.productShortDescription}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Selling Price</p>
                <p className="text-2xl font-bold text-accent-dark">{product.sellingPrice}</p>
              </div>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
              <p className="text-sm leading-relaxed text-[#666666] dark:text-zinc-400 whitespace-pre-wrap flex-1">
                {product.productDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">SKU</p>
                <p className="text-sm font-semibold dark:text-white">{product.stockKeepingUnit || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Stock QTY</p>
                <p className="text-sm font-semibold dark:text-white">{product.stockQuantity}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Low Threshold</p>
                <p className="text-sm font-semibold dark:text-white">{product.lowStockThreshold}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Cost Price</p>
                <p className="text-sm font-semibold dark:text-white">{product.costPrice}</p>
              </div>
            </div>
          </div>

          {/* Stock Conversion Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold dark:text-white">Stock Management</h3>
                <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">Convert units between bulk and base variants</p>
              </div>
              <Button onClick={() => setIsConversionModalOpen(true)} className="rounded-xl px-5 py-2.5 text-sm h-auto">
                Execute Conversion
              </Button>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                 <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Total Sold</p>
                    <p className="text-lg font-bold dark:text-white">{product.soldCount}</p>
                 </div>
                 {product.familyCode && (
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Family Code</p>
                      <p className="text-lg font-bold dark:text-white">{product.familyCode}</p>
                   </div>
                 )}
                 {product.conversionFactor && (
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Conversion Factor</p>
                      <p className="text-lg font-bold dark:text-white">x{product.conversionFactor}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {renderConversionModal()}
    </motion.div>
  );
};
