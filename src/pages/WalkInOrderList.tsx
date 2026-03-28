import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { formatPrice } from '../utils';
import { walkInService } from '../services/walkInService';
import { WalkInOrderResponse, WalkInOrderStatus } from '../types';
import toast from 'react-hot-toast';
import { Printer, Eye } from 'lucide-react';

export const WalkInOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<WalkInOrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [page, date]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await walkInService.getOrders(page, 10, date || undefined);
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast.error('Failed to load walk-in orders');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    [WalkInOrderStatus.COMPLETED]: 'success',
    [WalkInOrderStatus.CANCELLED]: 'danger',
    [WalkInOrderStatus.REFUNDED]: 'warning',
  };

  const columns = [
    {
      header: 'Order #',
      accessor: (o: WalkInOrderResponse) => (
        <span 
          className="font-bold text-zinc-900 dark:text-white hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/walk-in/${o.orderNumber}`);
          }}
        >
          {o.orderNumber}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: (o: WalkInOrderResponse) => o.customerName || 'Anonymous'
    },
    {
      header: 'Date',
      accessor: (o: WalkInOrderResponse) => new Date(o.createdAt).toLocaleDateString()
    },
    {
      header: 'Total',
      accessor: (o: WalkInOrderResponse) => formatPrice(o.totalAmount)
    },
    {
      header: 'Method',
      accessor: (o: WalkInOrderResponse) => o.paymentMethod
    },
    {
      header: 'Status',
      accessor: (o: WalkInOrderResponse) => (
        <Badge variant={statusColors[o.status] || 'info'}>
          {o.status}
        </Badge>
      )
    },
    {
      header: 'Receipt',
      accessor: (o: WalkInOrderResponse) => (
        <Badge variant={o.receiptPrinted ? 'success' : 'warning'}>
          {o.receiptPrinted ? 'Printed' : 'Pending'}
        </Badge>
      )
    },
  ];

  const handleMarkPrinted = async (orderNumber: string) => {
    try {
      await walkInService.markReceiptPrinted(orderNumber);
      toast.success('Receipt marked as printed');
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update receipt status');
    }
  };

  return (
    <AdminTable
      title="Walk-In Orders"
      data={orders}
      columns={columns}
      onAdd={() => navigate('/admin/walk-in/new')}
      onEdit={(o) => navigate(`/admin/walk-in/${o.orderNumber}`)}
      isLoading={isLoading}
      currentPage={page + 1}
      totalPages={totalPages}
      onPageChange={(p) => setPage(p - 1)}
      searchPlaceholder="Search order number..."
      itemsPerPage={10}
      filterNodes={
        <div className="flex items-center gap-2">
           <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(0); }}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 dark:text-white rounded-xl text-sm border-none focus:ring-1 focus:ring-accent outline-none"
          />
        </div>
      }
    />
  );
};
