import api from './api';

export const walletReportService = {
    // Get wallet report with filters and pagination
    async getWalletReport({
        user_id,
        branch_id,
        start_date,
        end_date,
        brand_id,
        customer_id,
        page = 1,
        limit = 50,
        sort_by = 'created_at',
        sort_order = 'desc'
    } = {}) {
        try {
            // Build params object
            const params = {
                page,
                limit,
                sort_by,
                sort_order,
            };

            // Add filters if provided
            if (user_id) params.user_id = user_id;
            if (branch_id) params.branch_id = branch_id;
            if (start_date) params.start_date = start_date;
            if (end_date) params.end_date = end_date;
            if (brand_id) params.brand_id = brand_id;
            if (customer_id) params.customer_id = customer_id;

            const response = await api.get('/wallet/wallet-report', { params });

            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to fetch wallet report');
            }

            return {
                success: true,
                data: response.data.data || [],
                summary: response.data.summary || {},
                pagination: response.data.pagination || {}
            };

        } catch (error) {
            console.error('Error fetching wallet report:', error);
            throw error;
        }
    },

    // Get wallet report summary for dashboard
    async getWalletReportSummary({
        user_id,
        branch_id,
        start_date,
        end_date,
        brand_id,
        customer_id
    } = {}) {
        try {
            const params = {};

            if (user_id) params.user_id = user_id;
            if (branch_id) params.branch_id = branch_id;
            if (start_date) params.start_date = start_date;
            if (end_date) params.end_date = end_date;
            if (brand_id) params.brand_id = brand_id;
            if (customer_id) params.customer_id = customer_id;

            const response = await api.get('/wallet/wallet-report/summary', { params });

            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Failed to fetch wallet report summary');
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching wallet report summary:', error);
            throw error;
        }
    },

    // Utility method to get yesterday's date in YYYY-MM-DD format
    getYesterdayDate() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    },

    // Utility method to format date for API
    formatDateForAPI(date) {
        return new Date(date).toISOString().split('T')[0];
    },

    // Get action type display name
    getActionTypeDisplayName(actionType) {
        const actionTypeMap = {
            'wallet_balance_increment': 'Balance Increment',
            'wallet_balance_decrement': 'Balance Decrement',
            'wallet_balance_transfer': 'Balance Transfer',
            'wallet_balance_refund': 'Balance Refund',
            'wallet_balance_adjustment': 'Balance Adjustment'
        };
        return actionTypeMap[actionType] || actionType;
    },

    // Format currency amount
    formatCurrency(amount, currency = 'AED') {
        const currencySymbols = {
            'AED': 'د.إ',
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        };

        const symbol = currencySymbols[currency] || currency;
        return `${symbol} ${parseFloat(amount).toFixed(2)}`;
    },

    // Get balance change indicator
    getBalanceChangeIndicator(actionType) {
        const incrementTypes = ['wallet_balance_increment', 'wallet_balance_refund'];
        const decrementTypes = ['wallet_balance_decrement'];

        if (incrementTypes.includes(actionType)) return '+';
        if (decrementTypes.includes(actionType)) return '-';
        return '';
    },

    // Get balance change color class
    getBalanceChangeColor(actionType) {
        const incrementTypes = ['wallet_balance_increment', 'wallet_balance_refund'];
        const decrementTypes = ['wallet_balance_decrement'];

        if (incrementTypes.includes(actionType)) return 'text-green-600';
        if (decrementTypes.includes(actionType)) return 'text-red-600';
        return 'text-gray-600';
    }
};

export default walletReportService;
