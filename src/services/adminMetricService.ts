import api from './api';
import {
    CustomApiResponse,
    PageResponse,
    CustomerDataResponse,
    MostPurchaseProductResponse,
    CouponMetricResponse,
    SiteVisitMetric,
    DashboardMetrics,
    TopCustomer,
    LowStockProduct
} from '../types';

export const adminMetricService = {
    /**
     * GET /api/v1/admin/metrics/customers
     * Paginated list of customers with metrics
     */
    getCustomerMetrics: async (page = 0, size = 10): Promise<PageResponse<CustomerDataResponse>> => {
        const response = await api.get<CustomApiResponse<PageResponse<CustomerDataResponse>>>(
            `/admin/metrics/customers`,
            { params: { page, size } }
        );
        return response.data.data;
    },

    /**
     * GET /api/v1/admin/metrics/top-products
     */
    getTopProducts: async (): Promise<MostPurchaseProductResponse[]> => {
        const response = await api.get<CustomApiResponse<MostPurchaseProductResponse[]>>(
            `/admin/metrics/top-products`
        );
        return response.data.data;
    },

    /**
     * GET /api/v1/admin/metrics/coupons
     */
    getCouponMetrics: async (): Promise<CouponMetricResponse> => {
        const response = await api.get<CustomApiResponse<CouponMetricResponse>>(
            `/admin/metrics/coupons`
        );
        return response.data.data;
    },

    /**
     * GET /api/v1/admin/metrics/site-metric
     */
    getSiteMetrics: async (from?: string, to?: string): Promise<SiteVisitMetric> => {
        const response = await api.get<CustomApiResponse<SiteVisitMetric>>(
            `/admin/metrics/site-metric`,
            { params: { from, to } }
        );
        return response.data.data;
    },

    /**
     * GET /api/v1/admin/metrics/dashboard-metric
     */
    getDashboardMetrics: async (): Promise<DashboardMetrics> => {
        const response = await api.get<CustomApiResponse<DashboardMetrics>>(
            `/admin/metrics/dashboard-metric`
        );
        return response.data.data;
    },

    /**
     * GET /api/v1/admin/metrics/top-customers
     */
    getTopCustomers: async (): Promise<TopCustomer[]> => {
        const response = await api.get<CustomApiResponse<TopCustomer[]>>(
            `/admin/metrics/top-customers`
        );
        return response.data.data;
    },

    /**
     * GET /api/v1/admin/metrics/low-stock-products
     */
    getLowStockProducts: async (): Promise<LowStockProduct[]> => {
        const response = await api.get<CustomApiResponse<LowStockProduct[]>>(
            `/admin/metrics/low-stock-products`
        );
        return response.data.data;
    }
};
