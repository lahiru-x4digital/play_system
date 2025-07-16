import api from './api'

export const walletService = {
    async getAllWallets({ page = 1, limit = 10, searchParams = {} }) {
        try {
            console.log('Fetching wallets with params:', { page, limit, skip: (page - 1) * limit, ...searchParams })

            const response = await api.get('/wallet', {
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
                data: response?.data,
                total: response.data.total || 0,
                pages: response.data.pages || 1,
                page: response.data.page || page
            }
        } catch (error) {
            console.error('Get wallets error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to fetch wallets')
        }
    },

    async createWallet(walletData) {
        try {
            console.log('Creating wallet with data:', walletData)
            const response = await api.post('/wallet', walletData)
            console.log('Create wallet response:', response.data)
            return response.data
        } catch (error) {
            console.error('Create wallet error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to create wallet')
        }
    },

    async updateWallet(walletId, walletData) {
        if (!walletId) {
            throw new Error('Wallet ID is required')
        }

        try {
            const response = await api.put(`/wallet?id=${walletId}`, walletData)
            return response.data
        } catch (error) {
            console.error('Update wallet error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to update wallet')
        }
    },

    async deleteWallet(walletId) {
        if (!walletId) {
            throw new Error('Wallet ID is required')
        }

        try {
            const response = await api.delete(`/wallet?id=${walletId}`)
            if (response.data?.success === false) {
                throw new Error(response.data.message || 'Failed to delete wallet')
            }
            return {
                success: true,
                message: response.data.message || 'Wallet deleted successfully'
            }
        } catch (error) {
            console.error('Delete wallet error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete wallet')
        }
    },

    async getWalletTransactions({ page = 1, limit = 10, searchParams = {} }) {
        try {
            console.log('Fetching wallet transactions with params:', { page, limit, skip: (page - 1) * limit, ...searchParams })
            const response = await api.get('/wallet/transaction', {
                params: {
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
    },

    async createTransaction(transactionData) {
        try {
            const response = await api.post('/wallet/transaction', transactionData)
            return response.data
        } catch (error) {
            console.error('Create transaction error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to create transaction')
        }
    },

    async updateTransaction(transactionId, transactionData) {
        if (!transactionId) {
            throw new Error('Transaction ID is required')
        }

        try {
            const response = await api.put(`/wallet/transaction?id=${transactionId}`, transactionData)
            return response.data
        } catch (error) {
            console.error('Update transaction error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to update transaction')
        }
    },

    async getWalletById(walletId) {
        if (!walletId) {
            throw new Error('Wallet ID is required')
        }

        try {
            console.log('Fetching wallet details:', walletId)
            const response = await api.get(`/wallet?id=${walletId}`)
            console.log('Get wallet response:', response.data)

            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Get wallet error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to fetch wallet details')
        }
    },

    async resetWallet() {
        try {
            const response = await api.patch(`/wallet`)
            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Wallet Reset error', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to reset wallet')
        }
    }
} 