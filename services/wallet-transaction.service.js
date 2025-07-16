import api from './api'

export const walletTransactionService = {
    async getAllTransactions({ page = 1, limit = 10, searchParams = {} }) {
        try {
            console.log('Fetching transactions with params:', { page, limit, skip: (page - 1) * limit, ...searchParams })

            const response = await api.get('/wallet/transaction', {
                params: {
                    page,
                    limit,
                    skip: (page - 1) * limit,
                    ...searchParams
                }
            })

            if (!response.data) {
                throw new Error('No data received from the API')
            }

            return {
                success: true,
                data: response.data.data || [],
                total: response.data.total || 0,
                pages: response.data.pages || 1,
                page: response.data.page || page
            }
        } catch (error) {
            console.error('Get transactions error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to fetch transactions')
        }
    },

    async getTransactionById(transactionId) {
        if (!transactionId) {
            throw new Error('Transaction ID is required')
        }

        try {
            console.log('Fetching transaction details:', transactionId)
            const response = await api.get(`/wallet/transaction?id=${transactionId}`)
            console.log('Get transaction response:', response.data)

            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Get transaction error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to fetch transaction details')
        }
    },

    async getTransactionsByWalletId(walletId, { page = 1, limit = 10, searchParams = {} }) {
        if (!walletId) {
            throw new Error('Wallet ID is required')
        }

        try {
            console.log('Fetching transactions for wallet:', walletId)
            const response = await api.get(`/wallet/transaction`, {
                params: {
                    wallet_id: walletId,
                    page,
                    limit,
                    skip: (page - 1) * limit,
                    ...searchParams
                }
            })

            return {
                success: true,
                data: response.data.data || [],
                total: response.data.total || 0,
                pages: response.data.pages || 1,
                page: response.data.page || page
            }
        } catch (error) {
            console.error('Get wallet transactions error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to fetch wallet transactions')
        }
    }
}
