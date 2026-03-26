import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MousePointer2,
  Clock,
  AlertCircle,
  Box
} from 'lucide-react';
import { formatPrice, cn } from '../utils';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { motion } from 'motion/react';
import { adminMetricService } from '../services/adminMetricService';
import { CouponMetricResponse, MostPurchaseProductResponse, SiteVisitMetric, TopCustomer, LowStockProduct } from '../types';
import toast from 'react-hot-toast';

const COLORS = ['#FFD1DC', '#FFB7C5', '#FF8DA1', '#E5E5E5'];

const salesAnalytics = {
  revenueBreakdown: [],
  orderStatus: [],
  miniStats: [
    { label: 'Avg Order Value', value: 'GHS 0.00', trend: '0%', isUp: true },
    { label: 'Total Revenue', value: 'GHS 0.00', trend: '0%', isUp: true },
    { label: 'Total Paid Orders', value: '0', trend: '0%', isUp: true },
  ]
};

const couponPerformance = {
  metrics: [
    { label: 'Coupons Created', value: '0' },
    { label: 'Coupon Usage', value: '0' },
    { label: 'Discount Given', value: 'GHS 0.00' },
    { label: 'Revenue Generated', value: 'GHS 0.00' },
  ],
  coupons: []
};

const productAnalytics = {
  mostPurchased: [],
  performance: [],
  lowStock: []
};

const customerAnalytics = {
  topCustomers: []
};

const trafficAnalytics = {
  summary: [
    { label: 'Total Visits', value: '0', icon: MousePointer2 },
    { label: 'Unique Visitors', value: '0', icon: Users },
    { label: 'Page Views', value: '0', icon: ShoppingBag },
    { label: 'Conversion Rate', value: '0.00%', icon: TrendingUp },
  ],
  visitedPages: [],
  trafficVsOrders: []
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A1A] dark:bg-zinc-800 text-white rounded-2xl px-4 py-3 shadow-xl text-sm">
      <p className="font-bold mb-1 text-[#FFD1DC]">{label}</p>
      <p className="text-white">{payload[0].value?.toLocaleString()} sold</p>
    </div>
  );
};

export const Analytics = () => {
  const [salesRange, setSalesRange] = useState('Day');
  const [couponData, setCouponData] = useState<CouponMetricResponse | null>(null);
  const [topProducts, setTopProducts] = useState<MostPurchaseProductResponse[]>([]);
  const [siteMetrics, setSiteMetrics] = useState<SiteVisitMetric | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingSiteMetrics, setIsLoadingSiteMetrics] = useState(true);
  const [isLoadingTopCustomers, setIsLoadingTopCustomers] = useState(true);
  const [isLoadingLowStock, setIsLoadingLowStock] = useState(true);

  useEffect(() => {
    fetchCouponMetrics();
    fetchTopProducts();
    fetchSiteMetrics();
    fetchTopCustomers();
    fetchLowStockProducts();
  }, []);

  const fetchSiteMetrics = async () => {
    try {
      const data = await adminMetricService.getSiteMetrics();
      setSiteMetrics(data);
    } catch (err) {
      console.error('Failed to fetch site metrics', err);
      toast.error('Failed to load site metrics');
    } finally {
      setIsLoadingSiteMetrics(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const data = await adminMetricService.getTopProducts();
      setTopProducts(data);
    } catch (err) {
      console.error('Failed to fetch top products', err);
      toast.error('Failed to load top products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCouponMetrics = async () => {
    try {
      const data = await adminMetricService.getCouponMetrics();
      setCouponData(data);
    } catch (err) {
      console.error('Failed to fetch coupon metrics', err);
      toast.error('Failed to load coupon metrics');
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const fetchTopCustomers = async () => {
    try {
      const data = await adminMetricService.getTopCustomers();
      setTopCustomers(data);
    } catch (err) {
      console.error('Failed to fetch top customers', err);
      toast.error('Failed to load top customers');
    } finally {
      setIsLoadingTopCustomers(false);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const data = await adminMetricService.getLowStockProducts();
      setLowStockProducts(data);
    } catch (err) {
      console.error('Failed to fetch low stock products', err);
      toast.error('Failed to load low stock products');
    } finally {
      setIsLoadingLowStock(false);
    }
  };

  const couponMetrics = [
    { label: 'Coupons Created', value: couponData?.totalCreated.toString() || '0' },
    { label: 'Coupon Usage', value: couponData?.totalUsage.toString() || '0' },
    { label: 'Discount Given', value: formatPrice(couponData?.totalDiscountGiven || '0') },
    { label: 'Revenue Generated', value: formatPrice(couponData?.totalRevenueGenerated || '0') },
  ];
  return (
    <div className="space-y-12 max-w-[1600px] mx-auto pb-20">
      {/* SECTION 1 — Sales Analytics */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent rounded-full" />
          <h2 className="text-2xl font-bold dark:text-white">Sales Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold dark:text-white">Revenue Breakdown</h3>
              <div className="flex bg-[#F5F5F5] dark:bg-zinc-800 p-1 rounded-xl">
                {['Day', 'Week', 'Month', 'Year'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSalesRange(t)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                      salesRange === t
                        ? "bg-white dark:bg-zinc-700 text-[#1A1A1A] dark:text-white shadow-sm"
                        : "text-[#999999] hover:text-[#1A1A1A] dark:hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
              {salesAnalytics.revenueBreakdown.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="w-8 h-8 text-[#999999] dark:text-zinc-500" />}
                  title="No Revenue Data"
                  description="Revenue data for the selected period will appear here."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesAnalytics.revenueBreakdown}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD1DC" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FFD1DC" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#FFD1DC" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8">
              {salesAnalytics.miniStats.map((stat, i) => (
                <div key={i} className="bg-[#FDFBFB] dark:bg-zinc-950 p-4 rounded-2xl border border-[#F5F5F5] dark:border-zinc-800">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999] mb-1">{stat.label}</p>
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold dark:text-white">{stat.value}</p>
                    <span className={cn(
                      "text-[10px] font-bold mb-1",
                      stat.isUp ? "text-emerald-600" : "text-red-500"
                    )}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-8 dark:text-white">Order Status Distribution</h3>
            {salesAnalytics.orderStatus.length === 0 ? (
              <div className="h-[300px]">
                <EmptyState
                  icon={<ShoppingBag className="w-8 h-8 text-[#999999] dark:text-zinc-500" />}
                  title="No Order Data"
                  description="Status distribution will appear when there are orders."
                />
              </div>
            ) : (
              <>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesAnalytics.orderStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {salesAnalytics.orderStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-6">
                  {salesAnalytics.orderStatus.map((status, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[#666666] dark:text-zinc-400">{status.name}</span>
                      </div>
                      <span className="font-bold dark:text-white">{status.count} ({Math.round(status.value / 1280 * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — Coupon Performance */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent rounded-full" />
          <h2 className="text-2xl font-bold dark:text-white">Coupon Performance</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {couponMetrics.map((metric, i) => (
              <div key={i}>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">{metric.label}</p>
                <p className="text-3xl font-bold dark:text-white">
                  {isLoadingCoupons ? '...' : metric.value}
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[300px] pr-2 pb-2 custom-scrollbar">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[#999999] border-b border-[#F5F5F5] dark:border-zinc-800">
                  <th className="pb-4">Coupon Code</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Usage Count</th>
                  <th className="pb-4">Expiry Date</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5] dark:divide-zinc-800">
                {isLoadingCoupons ? (
                  <tr>
                    <td colSpan={5} className="py-8"><EmptyState icon={<Clock className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="Loading coupons..." /></td>
                  </tr>
                ) : !couponData || couponData.coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8"><EmptyState title="No Coupons Found" description="Try creating a new coupon to see performance metrics." /></td>
                  </tr>
                ) : couponData.coupons.map((coupon, i) => (
                  <tr key={i}>
                    <td className="py-4 text-sm font-bold dark:text-zinc-300">{coupon.couponCode}</td>
                    <td className="py-4 text-sm dark:text-zinc-400">{coupon.discountType}</td>
                    <td className="py-4 text-sm font-bold dark:text-white">{coupon.usageCount} / {coupon.usageLimit}</td>
                    <td className="py-4 text-sm text-[#999999]">{new Date(coupon.expirationDate).toLocaleDateString()}</td>
                    <td className="py-4">
                      <Badge variant={coupon.isActive ? 'success' : 'default'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3 — Product Analytics */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent rounded-full" />
          <h2 className="text-2xl font-bold dark:text-white">Product Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-8 dark:text-white">Most Purchased Products</h3>
            <div className="h-[300px] w-full">
              {topProducts.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="w-8 h-8 text-[#999999] dark:text-zinc-500" />}
                  title="No Product Data"
                  description="Data will populate when purchases are made."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts.map(p => ({ name: p.productName, sold: p.soldCount }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,209,220,0.08)' }} />
                    <Bar dataKey="sold" fill="#FFD1DC" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-8 overflow-x-auto overflow-y-auto max-h-[300px] pr-2 pb-2 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-[#999999] border-b border-[#F5F5F5] dark:border-zinc-800">
                    <th className="pb-4">Product Name</th>
                    <th className="pb-4">Views</th>
                    <th className="pb-4">Add to Cart</th>
                    <th className="pb-4">Purchases</th>
                    <th className="pb-4">Conversion %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5] dark:divide-zinc-800">
                  {isLoadingProducts ? (
                    <tr>
                      <td colSpan={5} className="py-8"><EmptyState icon={<Clock className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="Loading products..." /></td>
                    </tr>
                  ) : topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8"><EmptyState title="No Products Found" description="Try creating a new product to see performance metrics." /></td>
                    </tr>
                  ) : topProducts.map((p, i) => (
                    <tr key={i}>
                      <td className="py-4 text-sm font-medium dark:text-zinc-300">{p.productName}</td>
                      <td className="py-4 text-sm dark:text-zinc-400">{p.viewCount.toLocaleString()}</td>
                      <td className="py-4 text-sm dark:text-zinc-400">{p.addToCartCount.toLocaleString()}</td>
                      <td className="py-4 text-sm font-bold dark:text-white">{p.soldCount.toLocaleString()}</td>
                      <td className="py-4 text-sm text-emerald-600 font-bold">{p.conversionRate.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
          >
            <div className="flex items-center gap-2 mb-8">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold dark:text-white">Low Stock Alert</h3>
            </div>
            {isLoadingLowStock ? (
              <div className="h-[250px] py-8 text-center text-zinc-500"><EmptyState icon={<Clock className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="Loading stock products..." /></div>
            ) : !lowStockProducts || lowStockProducts.length === 0 ? (
              <div className="h-[250px]">
                <EmptyState icon={<AlertCircle className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="Stock Levels Good" description="No products are currently running low on stock." />
              </div>
            ) : (
              <div className="space-y-6 overflow-x-auto overflow-y-auto max-h-[350px] pr-2 pb-2 custom-scrollbar">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-[#FDFBFB] dark:bg-zinc-950 rounded-2xl border border-[#F5F5F5] dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                        {p.productImage ? (
                          <img src={p.productImage} alt={p.productName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Box className="h-5 w-5 opacity-50 text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{p.productName}</p>
                        <p className="text-xs text-[#999999]">Remaining: {p.stockQuantity}</p>
                      </div>
                    </div>
                    <Badge variant="danger">Low Stock</Badge>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* SECTION 4 — Customer Analytics */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent rounded-full" />
          <h2 className="text-2xl font-bold dark:text-white">Customer Analytics</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
        >
          <h3 className="text-lg font-bold mb-6 dark:text-white">Top Customers</h3>
          <div className="overflow-x-auto overflow-y-auto max-h-[300px] pr-2 pb-2 custom-scrollbar">
            <table className="w-full text-left relative">
              <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-[#999999] border-b border-[#F5F5F5] dark:border-zinc-800">
                  <th className="pb-4 pl-4">Customer Name</th>
                  <th className="pb-4 text-center">Orders Count</th>
                  <th className="pb-4 pr-4 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5] dark:divide-zinc-800">
                {isLoadingTopCustomers ? (
                  <tr>
                    <td colSpan={3} className="py-8"><EmptyState icon={<Clock className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="Loading top customers..." /></td>
                  </tr>
                ) : !topCustomers || topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8"><EmptyState icon={<Users className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="No Customers Found" description="Customer purchase behavior will appear here." /></td>
                  </tr>
                ) : topCustomers.map((c, i) => (
                  <tr key={i}>
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-sm">
                          {c.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-zinc-300">{c.fullName}</p>
                          <p className="text-xs text-[#999999] dark:text-zinc-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center text-sm dark:text-zinc-400">{c.totalOrders}</td>
                    <td className="py-4 pr-4 text-right text-sm font-bold dark:text-white">{formatPrice(c.totalAmountSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* SECTION 5 — Traffic Analytics */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-accent rounded-full" />
          <h2 className="text-2xl font-bold dark:text-white">Traffic Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Visits', value: siteMetrics?.totalVisits?.toLocaleString() || '0', icon: MousePointer2 },
            { label: 'Unique Visitors', value: siteMetrics?.totalUniqueVisitors?.toLocaleString() || '0', icon: Users },
            { label: 'Page Views', value: siteMetrics?.totalPageViews?.toLocaleString() || '0', icon: ShoppingBag },
            { label: 'Conversion Rate', value: `${siteMetrics?.uniqueVisitToOrderConversionRate?.toFixed(2) || '0.00'}%`, icon: TrendingUp },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800">
              <div className="p-3 bg-accent/10 rounded-2xl text-accent-dark mb-4 w-fit">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">{stat.label}</p>
              <p className="text-2xl font-bold dark:text-white">
                {isLoadingSiteMetrics ? '...' : stat.value}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-6 dark:text-white">Most Visited Pages</h3>
            <div className="space-y-6 overflow-x-auto overflow-y-auto max-h-[350px] pr-2 pb-2 custom-scrollbar">
              {isLoadingSiteMetrics ? (
                <div className="py-8 text-center text-zinc-500"><EmptyState icon={<Clock className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="Loading metrics..." /></div>
              ) : !siteMetrics || siteMetrics.top5MostVisitedPages.length === 0 ? (
                <div className="py-8 text-center text-zinc-500"><EmptyState icon={<MousePointer2 className="w-8 h-8 text-[#999999] dark:text-zinc-500" />} title="No Traffic Data" description="Page visits data will be displayed here." /></div>
              ) : siteMetrics.top5MostVisitedPages.map((page, i) => {
                const maxVisits = Math.max(...siteMetrics.top5MostVisitedPages.map(p => p.uniqueVisits));
                const sharePercentage = (page.uniqueVisits / maxVisits) * 100;

                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#666666] dark:text-zinc-400 font-mono">{page.page}</span>
                      <span className="font-bold dark:text-white">{page.uniqueVisits.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-[#F5F5F5] dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${sharePercentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] card-shadow border border-[#F5F5F5] dark:border-zinc-800"
          >
            <h3 className="text-lg font-bold mb-8 dark:text-white">Traffic vs Orders Comparison</h3>
            <div className="h-[350px] w-full">
              {trafficAnalytics.trafficVsOrders.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="w-8 h-8 text-[#999999] dark:text-zinc-500" />}
                  title="No Comparison Data"
                  description="Traffic and orders trend will appear here."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficAnalytics.trafficVsOrders}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999999' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="visits" stroke="#FFD1DC" strokeWidth={3} dot={{ r: 4, fill: '#FFD1DC' }} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#1A1A1A" strokeWidth={3} dot={{ r: 4, fill: '#1A1A1A' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
