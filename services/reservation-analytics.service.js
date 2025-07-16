import { showApiError } from '@/lib/apiErrorHandler';
import api from './api';

export const reservationAnalyticsService = {
    async getReservationAnalytics(startDate, endDate, timeRange, branchCode, country, brand) {
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

            const response = await api.get('/dashboard/reservations/analytics', {
                params
            });

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch reservation analytics");
            console.error('Error fetching reservation analytics:', error);
            throw error;
        }
    },

    async getRefundedReservations(startDate, endDate, timeRange, branchCode, country, brand) {
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

            const response = await api.get('/dashboard/reservations/refunded-rate', {
                params
            });

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch refunded reservations");
            console.error('Error fetching refunded reservations:', error);
            throw error;
        }
    },

    async getTotalRevenue(startDate, endDate, timeRange, branchCode, country, brand) {
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

            const response = await api.get('/dashboard/reservations/revenue', {
                params
            });

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch total revenue");
            console.error('Error fetching total revenue:', error);
            throw error;
        }
    }
};
