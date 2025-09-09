import { showApiError } from '@/lib/apiErrorHandler';
import api from './api'

export const eventRulesService = {
    async getAllEventRules(page = 1, limit = 10) {
        try {
            const response = await api.get('/salt-al-bahar/event-rules', {
                params: {
                    page,
                    limit
                }
            })

            // Return the direct response structure
            return {
                success: true,
                data: response.data.data || [],
                total: response.data.total,
                page: response.data.page,
                pages: response.data.pages
            }
        } catch (error) {
            showApiError(error, "Failed to load event rules");
            console.error('Error fetching event rules:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch event rules')
        }
    },

    async getEventRulesById(id) {
        try {
            const response = await api.get(`/salt-al-bahar/event-rules?id=${id}`)
            return response.data
        } catch (error) {
            showApiError(error, "Failed to get event rules by id");
            console.error('Error fetching event rules by id:', error)
            throw new Error(error.response?.data?.message || 'Failed to fetch event rules by id')
        }
    },

    async createEventRule(eventRuleData) {
        try {
            const response = await api.post('/salt-al-bahar/event-rules', eventRuleData)

            return response.data
        } catch (error) {
            console.error('Error creating event rule:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create event rule'
            }
        }
    },

    async updateEventRule(eventRuleId, data) {
        if (!eventRuleId) {
            throw new Error('Event rule ID is required')
        }

        try {
            const response = await api.put(`/salt-al-bahar/event-rules?id=${eventRuleId}`, data)

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update event rule')
            }

            return response.data
        } catch (error) {
            showApiError(error, "Failed to update event rule");
            console.error('Error updating event rule:', error)
            throw new Error(error.response?.data?.message || 'Failed to update event rule')
        }
    },

    async deleteEventRule(eventRuleId) {
        if (!eventRuleId) {
            throw new Error('Event rule ID is required')
        }

        try {
            const response = await api.delete(`/salt-al-bahar/event-rules?id=${eventRuleId}`)

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete event rule')
            }

            return response.data
        } catch (error) {
            showApiError(error, "Failed to delete event rule");
            console.error('Error deleting event rule:', error)
            throw new Error(error.response?.data?.message || 'Failed to delete event rule')
        }
    }
} 