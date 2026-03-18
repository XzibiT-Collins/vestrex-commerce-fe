import React, { useState, useEffect } from 'react';
import { AdminTable } from '../components/AdminTable';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ImageUpload } from '../components/ImageUpload';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { ProductListing, ProductDetails, CategoryResponse, Currency } from '../types';
import toast from 'react-hot-toast';
import { parsePrice } from '../utils';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { Checkbox } from '../components/Checkbox';
import { useDebounce } from '../hooks/useDebounce';

const CURRENCIES: Currency[] = [Currency.USD, Currency.EUR, Currency.GBP, Currency.GHS];

const emptyForm = {
  productName: '',
  shortDescription: '',
  productDescription: '',
  stockKeepingUnit: '',
  currency: 'GHS' as Currency,
  sellingPrice: '',
  costPrice: '',
  stockQuantity: '',
  lowStockThreshold: '',
  categoryId: '',
  isActive: true,
  isFeatured: false,
  productImage: null as File | null,
};

const PAGE_SIZE = 10;

export const ProductManagement = () => {
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const isSearching = debouncedSearch.trim().length > 0;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetails | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = (page: number) => {
    setIsLoading(true);
    productService.getListings(page - 1, PAGE_SIZE)
      .then((res) => {
        setProducts(res.content);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setIsLoading(false));
  };

  // Load initial data
  useEffect(() => {
    categoryService.getAll()
      .then((cats) => setCategories(cats))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!isSearching) {
      loadProducts(currentPage);
    }
  }, [currentPage, isSearching]);

  // Search mode: fires when debounced query changes
  useEffect(() => {
    if (!isSearching) return;
    setIsLoading(true);
    productService.search({ searchTerm: debouncedSearch, page: 0, size: PAGE_SIZE })
      .then((res) => {
        setProducts(res.content);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => toast.error('Search failed'))
      .finally(() => setIsLoading(false));
  }, [debouncedSearch]);

  const openModal = async (product?: ProductListing) => {
    if (product) {
      toast.loading('Fetching details...', { id: 'fetch-details' });
      try {
        const fullDetails = await productService.getById(product.productId);
        setEditingProduct(fullDetails);
        setFormData({
          productName: fullDetails.productName,
          shortDescription: fullDetails.productShortDescription,
          productDescription: fullDetails.productDescription,
          stockKeepingUnit: fullDetails.stockKeepingUnit || '',
          currency: 'GHS',
          sellingPrice: String(parsePrice(fullDetails.sellingPrice)),
          costPrice: String(parsePrice(fullDetails.costPrice)),
          stockQuantity: String(fullDetails.stockQuantity),
          lowStockThreshold: String(fullDetails.lowStockThreshold || ''),
          categoryId: String(fullDetails.category?.categoryId || ''),
          isActive: fullDetails.isActive,
          isFeatured: fullDetails.isFeatured,
          productImage: null,
        });
        toast.dismiss('fetch-details');
      } catch (err) {
        toast.error('Failed to fetch product details', { id: 'fetch-details' });
        return;
      }
    } else {
      setEditingProduct(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('productName', formData.productName);
    fd.append('shortDescription', formData.shortDescription);
    fd.append('productDescription', formData.productDescription);
    if (formData.stockKeepingUnit) fd.append('stockKeepingUnit', formData.stockKeepingUnit);
    fd.append('currency', formData.currency);
    fd.append('sellingPrice', formData.sellingPrice);
    fd.append('costPrice', formData.costPrice);
    fd.append('stockQuantity', formData.stockQuantity);
    if (formData.lowStockThreshold) fd.append('lowStockThreshold', formData.lowStockThreshold);
    fd.append('categoryId', formData.categoryId);
    fd.append('isActive', String(formData.isActive));
    fd.append('isFeatured', String(formData.isFeatured));
    if (formData.productImage) fd.append('productImage', formData.productImage);
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingProduct) {
        const updated = await productService.update(editingProduct.productId, buildFormData());
        // Update local list - we only need the ProductListing shape for the table
        setProducts((prev) => prev.map((p) => (p.productId === updated.productId ? {
          ...p,
          productName: updated.productName,
          productShortDescription: updated.productShortDescription,
          productImageUrl: updated.productImageUrl,
          price: updated.sellingPrice, // Note: sellingPrice in details maps to price in listing
          categoryName: updated.category?.categoryName || p.categoryName
        } : p)));
        toast.success('Product updated');
      } else {
        const created = await productService.create(buildFormData());
        // Add to list as a listing
        const newListing: ProductListing = {
          productId: created.productId,
          productName: created.productName,
          productShortDescription: created.productShortDescription,
          productImageUrl: created.productImageUrl,
          categoryName: categories.find(c => String(c.categoryId) === formData.categoryId)?.categoryName || '',
          price: created.sellingPrice,
          stockQuantity: created.stockQuantity,
          isOutOfStock: created.isOutOfStock,
          slug: created.slug
        };
        setProducts((prev) => [newListing, ...prev]);
        toast.success('Product created');
      }
      setIsModalOpen(false);
      // Reload current page to reflect server state
      loadProducts(currentPage);
    } catch (err: any) {
      toast.error(err.response?.data?.description || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (product: ProductListing) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.delete(productToDelete.productId);
      toast.success('Product deleted');
      // If last item on page, go back one page; otherwise reload current page
      const nextPage = products.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        loadProducts(currentPage);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.description || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const setField = (key: keyof typeof emptyForm, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const columns = [
    {
      header: 'Product',
      accessor: (p: ProductListing) => (
        <div className="flex items-center gap-3">
          {p.productImageUrl && (
            <img src={p.productImageUrl} className="h-10 w-10 rounded-lg object-cover" />
          )}
          <div>
            <p className="font-semibold dark:text-white">{p.productName}</p>
          </div>
        </div>
      ),
    },
    { header: 'Category', accessor: (p: ProductListing) => p.categoryName || '—' },
    { header: 'Price', accessor: (p: ProductListing) => p.price },
    { header: 'Stock', accessor: (p: ProductListing) => p.stockQuantity },
    { header: 'Status', accessor: (p: ProductListing) => 'Active' }, // Default for listing
  ];

  return (
    <>
      <AdminTable<ProductListing>
        title="Products"
        data={products}
        columns={columns}
        onAdd={() => openModal()}
        onEdit={(p) => openModal(p)}
        onDelete={handleDeleteClick as any}
        isLoading={isLoading}
        searchPlaceholder="Search products..."
        onSearch={(q) => setSearchQuery(q)}
        {...(!isSearching && {
          currentPage,
          totalPages,
          onPageChange: (page: number) => setCurrentPage(page),
        })}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Product Name" value={formData.productName}
            onChange={(e) => setField('productName', e.target.value)} required />
          <Input label="Short Description" value={formData.shortDescription}
            onChange={(e) => setField('shortDescription', e.target.value)} required />
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
              Full Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-zinc-800 dark:text-white rounded-xl text-sm border-none focus:ring-1 focus:ring-accent min-h-[80px] outline-none"
              value={formData.productDescription}
              onChange={(e) => setField('productDescription', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                Currency
              </label>
              <Dropdown
                value={formData.currency}
                onChange={(val) => setField('currency', val as Currency)}
                options={CURRENCIES.map((c) => ({ label: c, value: c }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                Category
              </label>
              <Dropdown
                value={formData.categoryId}
                onChange={(val) => setField('categoryId', val)}
                options={[
                  { label: 'Select...', value: '' },
                  ...categories.map((c) => ({ label: c.categoryName, value: String(c.categoryId) })),
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Selling Price" type="number" step="0.01" value={formData.sellingPrice}
              onChange={(e) => setField('sellingPrice', e.target.value)} required />
            <Input label="Cost Price" type="number" step="0.01" value={formData.costPrice}
              onChange={(e) => setField('costPrice', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Quantity" type="number" value={formData.stockQuantity}
              onChange={(e) => setField('stockQuantity', e.target.value)} required />
            <Input label="Low Stock Threshold" type="number" value={formData.lowStockThreshold}
              onChange={(e) => setField('lowStockThreshold', e.target.value)} />
          </div>

          <Input label="SKU (optional)" value={formData.stockKeepingUnit}
            onChange={(e) => setField('stockKeepingUnit', e.target.value)} />

          <div className="flex gap-6">
            <Checkbox
              checked={formData.isActive}
              onChange={(v) => setField('isActive', v)}
              label="Active"
            />
            <Checkbox
              checked={formData.isFeatured}
              onChange={(v) => setField('isFeatured', v)}
              label="Featured"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
              Product Image
            </label>
            <label className="flex flex-col items-center justify-center w-full cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setField('productImage', e.target.files?.[0] || null)}
              />
              {formData.productImage ? (
                /* Preview of selected image */
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-accent-dark/40">
                  <img
                    src={URL.createObjectURL(formData.productImage)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-bold">Click to change image</p>
                  </div>
                </div>
              ) : editingProduct?.productImageUrl ? (
                /* Show existing image when editing */
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-[#E5E5E5] dark:border-zinc-700">
                  <img
                    src={editingProduct.productImageUrl}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-bold">Click to change image</p>
                  </div>
                </div>
              ) : (
                /* Empty upload zone */
                <div className="w-full h-40 rounded-2xl border-2 border-dashed border-[#D4D4D4] dark:border-zinc-700 group-hover:border-accent-dark transition-colors flex flex-col items-center justify-center gap-3 bg-[#FAFAFA] dark:bg-zinc-800/50">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-[#999999] mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </label>
          </div>

          <Button type="submit" className="w-full h-12 rounded-2xl" isLoading={isSaving}>
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={
          <>
            Are you sure you want to delete the product <strong>{productToDelete?.productName}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete Product"
        isLoading={isDeleting}
      />
    </>
  );
};
