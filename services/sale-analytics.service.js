import { showApiError } from '@/lib/apiErrorHandler';
import api from './api';

export const saleAnalyticsService = {
    async getSaleAnalytics(startDate, endDate, timeRange, branchCode, country, brand) {
        try {
            const params = {
                start_date: startDate,
                end_date: endDate,
                time_range: timeRange,
                branch: branchCode,
                country: country,
                brand: brand
            };

            // Remove undefined/empty values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            const response = await api.get('/dashboard/sales/analytics', {
                params
            });

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch sale analytics");
            console.error('Error fetching sale analytics:', error);
            throw error;
        }
    },

    async getSalesReport(startDate, endDate, timeRange, branchCode, country, brand) {
        try {
            const params = {
                start_date: startDate,
                end_date: endDate,
                time_range: timeRange,
                branch_code: branchCode,
                country: country,
                brand: brand
            };

            // Remove undefined/empty values
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

            const response = await api.get('/dashboard/sales/report', {
                params
            });

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch sales report");
            console.error('Error fetching sales report:', error);
            throw error;
        }
    }
};
