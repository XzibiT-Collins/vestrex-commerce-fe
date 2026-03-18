import api from './api';
import type { CustomApiResponse, TaxCalculationResult } from '../types';

export const taxService = {
    /**
     * Calculate taxes for a given subtotal.
     * GET /api/v1/tax?subtotal={subtotal}
     */
    calculateTax: async (subtotal: number): Promise<TaxCalculationResult> => {
        const res = await api.get<CustomApiResponse<TaxCalculationResult>>(
            '/tax',
            { params: { subtotal } }
        );
        return res.data.data;
    },
};
