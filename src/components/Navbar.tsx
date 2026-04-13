import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, LogOut, LayoutDashboard, Search, Menu, X, Loader2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './Button';
import { useState, useEffect, useRef } from 'react';
import { UserRole, ProductListing } from '../types';
import { productService } from '../services/productService';
import { useDebounce } from '../hooks/useDebounce';
import { motion, AnimatePresence } from 'motion/react';
import { getAdminHomePath } from '../utils/adminNavigation';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch results when debounced search term changes
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    productService.search({ searchTerm: debouncedSearch, page: 0, size: 5 })
      .then(res => {
        if (res && Array.isArray(res.content)) {
          setSearchResults(res.content);
        }
      })
      .catch(() => setSearchResults([]))
      .finally(() => setIsSearching(false));
  }, [debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/products/${slug}`);
    setShowDropdown(false);
    setSearchTerm('');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-[#E5E5E5] dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
              PERFUME<span className="font-sans font-light text-accent-dark">BUDGET</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#666666] dark:text-zinc-400">
              <Link to="/products" className="hover:text-accent-dark transition-colors">Fragrances</Link>
              <Link to="/categories" className="hover:text-accent-dark transition-colors">Collections</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Desktop Search */}
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <input
                  type="text"
                  placeholder="Find your scent..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-10 pr-10 py-1.5 bg-[#F5F5F5] dark:bg-zinc-900 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent w-48 transition-all focus:w-72 border border-[#E5E5E5] dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-accent-dark" />
                )}
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showDropdown && searchTerm.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl border border-[#E5E5E5] dark:border-zinc-800 shadow-2xl overflow-hidden min-w-[320px]"
                  >
                    <div className="p-2">
                      {isSearching && searchResults.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-[#999999]">
                          Searching for "{searchTerm}"...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#999999] border-b border-[#F5F5F5] dark:border-zinc-800 mb-1">
                            Products
                          </div>
                          {searchResults.map((product) => (
                            <button
                              key={product.productId}
                              onClick={() => handleProductClick(product.slug || '')}
                              className="w-full flex items-center gap-3 p-2 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 rounded-xl transition-colors text-left group"
                            >
                              <div className="h-12 w-12 rounded-lg bg-[#F5F5F5] dark:bg-zinc-800 overflow-hidden shrink-0">
                                {product.productImageUrl ? (
                                  <img
                                    src={product.productImageUrl}
                                    alt={product.productName}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Search className="h-4 w-4 text-[#CCCCCC]" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                  {product.productName}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-accent-dark font-bold">{product.price}</span>
                                  <span className="text-[10px] text-[#999999] dark:text-zinc-500 truncate">{product.categoryName}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full mt-1 p-2.5 text-center text-xs font-bold text-accent-dark hover:bg-accent/5 dark:hover:bg-accent/10 rounded-xl transition-colors border-t border-[#F5F5F5] dark:border-zinc-800"
                          >
                            View all results for "{searchTerm}"
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-[#666666] dark:text-zinc-400">No fragrances found for "{searchTerm}"</p>
                          <p className="text-xs text-[#999999] mt-1">Try a different keyword</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent/20 rounded-full transition-colors text-zinc-600 dark:text-zinc-400 hover:text-accent-dark"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-accent/20 rounded-full transition-colors group"
            >
              <ShoppingBag className="h-5 w-5 text-zinc-700 dark:text-zinc-400 group-hover:text-accent-dark" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-accent-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2 border-l border-[#E5E5E5] dark:border-zinc-800 pl-4">
                {user.role === UserRole.ADMIN || user.role === UserRole.FRONT_DESK ? (
                  <Link to={getAdminHomePath(user)}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={user.role === UserRole.FRONT_DESK ? 'Walk-In Orders' : 'Admin Dashboard'}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" title="My Profile">
                      <UserIcon className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Join</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent/20 rounded-full transition-colors text-zinc-600 dark:text-zinc-400"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <ShoppingBag className="h-5 w-5 text-zinc-700 dark:text-zinc-400" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-accent-dark text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-zinc-700 dark:text-zinc-300">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-[#E5E5E5] dark:border-zinc-800 px-4 py-6 space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search fragrances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] dark:bg-zinc-900 rounded-xl text-sm focus:outline-none border-none text-zinc-900 dark:text-white"
              />
            </form>
          </div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#999999]">Menu</p>
          </div>
          <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-900 dark:text-white">Shop All</Link>
          <Link to="/categories" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-900 dark:text-white">Categories</Link>
          <hr className="border-[#E5E5E5] dark:border-zinc-800" />
          {user ? (
            <>
              {user.role === UserRole.ADMIN || user.role === UserRole.FRONT_DESK ? (
                <Link to={getAdminHomePath(user)} onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-900 dark:text-white">
                  {user.role === UserRole.FRONT_DESK ? 'Walk-In Orders' : 'Admin Dashboard'}
                </Link>
              ) : (
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-900 dark:text-white">My Profile</Link>
              )}
              <button onClick={handleLogout} className="block text-lg font-medium text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-900 dark:text-white">Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-zinc-900 dark:text-white">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
