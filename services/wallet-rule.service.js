import api from './api'

export const walletRuleService = {
    async getAllWalletRules({ page = 1, limit = 10, searchParams = {} }) {
        try {

            const response = await api.get('/wallet/rules', {
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
                data: response?.data.data || [],
                total: response.data.total || 0,
                pages: response.data.pages || 1,
                page: response.data.page || page
            }
        } catch (error) {
            console.error('Get wallet rules error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to fetch wallet rules')
        }
    },

    async createWalletRule(ruleData) {
        try {
            const response = await api.post('/wallet/rules', ruleData)
            return response.data
        } catch (error) {
            console.error('Create wallet rule error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to create wallet rule')
        }
    },

    async updateWalletRule(ruleId, ruleData) {
        if (!ruleId) {
            throw new Error('Rule ID is required')
        }

        try {
            const response = await api.put('/wallet/rules', {
                id: ruleId,
                ...ruleData
            })
            return response.data
        } catch (error) {
            console.error('Update wallet rule error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to update wallet rule')
        }
    },

    async deleteWalletRule(ruleId) {
        if (!ruleId) {
            throw new Error('Rule ID is required')
        }

        try {
            const response = await api.delete(`/wallet/rules?id=${ruleId}`)
            if (response.data?.success === false) {
                throw new Error(response.data.message || 'Failed to delete rule')
            }
            return {
                success: true,
                message: response.data.message || 'Rule deleted successfully'
            }
        } catch (error) {
            console.error('Delete wallet rule error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete rule')
        }
    },

    async getWalletRuleById(ruleId) {
        if (!ruleId) {
            throw new Error('Rule ID is required')
        }

        try {
            const response = await api.get(`/wallet/rules?id=${ruleId}`)

            return {
                success: true,
                data: response.data
            }
        } catch (error) {
            console.error('Get wallet rule error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            })
            throw new Error(error.response?.data?.message || 'Failed to fetch wallet rule details')
        }
    }
}
