import { showApiError } from '@/lib/apiErrorHandler'
import api from './api'

export const giftCardService = {
    async getAllGiftCards({ page = 1, limit = 10, searchParams = {} }) {
        try {
            const response = await api.get('/gift-cards/regular', {
                params: {
                    page,
                    limit,
                    ...searchParams = {}
                }
            })

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch gift cards')
            }

            return {
                success: true,
                data: response.data.data || [],
                total: response.data.total,
                page: response.data.page,
                pages: response.data.pages
            }

        } catch (error) {
            console.error('Get gift cards error:', error)
            showApiError(error, "Failed to fetch gift cards");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch gift cards',
                data: [],
                total: 0,
                pages: 1,
                page: page
            }
        }
    },

    async getAssignedGiftCards(customerId) {
        try {
            const response = await api.get(`/gift-cards/customer?customerId=${customerId}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch gift cards for this customer');
            }

            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Get gift cards by customer ID error:', error);
            showApiError(error, "Failed to fetch gift cards for this customer");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch gift cards for this customer',
                data: []
            };
        }
    },

    async assignGiftCard({ regular_gift_card_id, amount, customer_mobile_number, branch_id, brand_id }) {
        if (!regular_gift_card_id) {
            throw new Error('Gift card ID is required');
        }
        if (!customer_mobile_number) {
            throw new Error('Customer mobile number is required');
        }
        if (!branch_id) {
            throw new Error('Branch ID is required');
        }

        try {
            const response = await api.post('/gift-cards/purchase', {
                regular_gift_card_id,
                amount: amount,
                customer_mobile_number,
                branch_id,
                brand_id
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to assign gift card');
            }

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || 'Gift card assigned successfully'
            };
        } catch (error) {
            console.error('Assign gift card error:', error);
            showApiError(error, "Failed to assign gift card");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to assign gift card',
                data: null
            };
        }
    },

    async removeGiftCard(customerId, giftCardId) {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }
        if (!giftCardId) {
            throw new Error('Gift card ID is required');
        }

        try {
            const response = await api.delete(`/gift-cards/customer`, {
                params: {
                    customerId,
                    giftCardId
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to remove gift card');
            }

            return {
                success: true,
                message: response.data.message || 'Gift card removed successfully'
            };
        } catch (error) {
            console.error('Remove gift card error:', error);
            showApiError(error, "Failed to remove gift card");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to remove gift card',
                data: null
            };
        }
    },

    async getCurrency() {
        try {
            const response = await api.get('/country');

            // Validate response structure
            if (!response.data?.data || !Array.isArray(response.data.data)) {
                throw new Error('Invalid response format');
            }

            // Filter and transform data
            const filteredCurrencies = response.data.data
                .filter(item => {
                    return item?.id &&
                        typeof item.id === 'number' &&
                        item?.currency &&
                        typeof item.currency === 'string' &&
                        item.currency.trim().length === 3 &&
                        /^[A-Za-z]{3}$/.test(item.currency);
                })
                .map(item => ({
                    id: item.id,
                    currency: item.currency.toUpperCase()
                }))
                .filter((item, index, self) =>
                    index === self.findIndex(t =>
                        t.id === item.id && t.currency === item.currency
                    )
                );

            if (filteredCurrencies.length === 0) {
                throw new Error('No valid currencies found');
            }

            // Sort by id
            return filteredCurrencies.sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error('Get currency error:', error);
            showApiError(error, "Failed to fetch currency data");
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Failed to fetch currency data';
            throw new Error(errorMessage);
        }
    },

    async createGiftCard(giftCardData) {
        try {

            // Format the data according to the API requirements
            const formattedData = {
                card_name: giftCardData.card_name,
                amount_type: giftCardData.amount_type,
                brand_id: giftCardData.brand_id,
                branch_id: giftCardData.branch_id,
                currency: giftCardData.currency,
                amount: giftCardData.amount,
                description: giftCardData.description,
                duration: giftCardData.duration,
                start_date: giftCardData.start_date,
                min_value: giftCardData.min_value,
                max_value: giftCardData.max_value,
                image_url: giftCardData.image_url,
                number_of_cards: giftCardData.number_of_cards
            }

            // Remove any undefined or null values
            Object.keys(formattedData).forEach(key => {
                if (formattedData[key] === undefined || formattedData[key] === null) {
                    delete formattedData[key];
                }
            });

            const response = await api.post('/gift-cards/regular', formattedData)

            console.log('API response:', response.data) // Debug log

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create gift card')
            }

            // Validate the response data
            if (!response.data.data) {
                throw new Error('Invalid response format from server')
            }

            return response.data
        } catch (error) {
            console.error('Service error:', error)
            showApiError(error, "Failed to create gift card");
            if (error.response) {
                // Handle specific API errors
                throw new Error(error.response.data.message || 'Failed to create gift card')
            }
            throw error
        }
    },

    async createBulkGiftCard(giftCardData) {
        try {
            // Format the data according to the API requirements
            const formattedData = {
                card_name: giftCardData.card_name,
                amount_type: giftCardData.amount_type,
                brand_id: giftCardData.brand_id,
                branch_id: giftCardData.branch_id,
                currency: giftCardData.currency,
                amount: giftCardData.amount,
                description: giftCardData.description,
                duration: giftCardData.duration,
                created_at: giftCardData.created_at,
                expiry_date: giftCardData.expiry_date,
                image_url: giftCardData.image_url,
                number_of_cards: giftCardData.number_of_cards
            }

            // Remove any undefined or null values
            Object.keys(formattedData).forEach(key => {
                if (formattedData[key] === undefined || formattedData[key] === null) {
                    delete formattedData[key];
                }
            });

            const response = await api.post('/gift-cards/bulk', formattedData)

            console.log('API response:', response.data) // Debug log

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create bulk gift cards')
            }

            // Validate the response data
            if (!response.data.data) {
                throw new Error('Invalid response format from server')
            }

            return response.data
        } catch (error) {
            console.error('Service error:', error)
            showApiError(error, "Failed to create bulk gift cards");
            if (error.response) {
                // Handle specific API errors
                throw new Error(error.response.data.message || 'Failed to create bulk gift cards')
            }
            throw error
        }
    },

    async updateGiftCard(giftCardId, giftCardData) {
        if (!giftCardId) {
            throw new Error('Gift card ID is required')
        }

        try {

            const formattedData = {
                card_name: giftCardData.card_name,
                amount_type: giftCardData.amount_type,
                brand_id: giftCardData.brand_id,
                branch_id: giftCardData.branch_id,
                currency: giftCardData.currency,
                amount: giftCardData.amount,
                description: giftCardData.description,
                duration: giftCardData.duration,
                min_value: giftCardData.min_value,
                max_value: giftCardData.max_value,
                image_url: giftCardData.image_url,
                number_of_cards: giftCardData.number_of_cards
            }

            // Remove any undefined or null values, but allow empty strings for image_url
            Object.keys(formattedData).forEach(key => {
                if (formattedData[key] === undefined ||
                    (formattedData[key] === null && key !== 'image_url')) {
                    delete formattedData[key];
                }
            });

            // Make the main update request with JSON data
            const response = await api.put(`/gift-cards/regular?id=${giftCardId}`, formattedData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('API response:', response.data)

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update gift card')
            }

            return response.data
        } catch (error) {
            console.error('Service error:', error)
            showApiError(error, "Failed to update gift card");
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to update gift card')
            }
            throw error
        }
    },

    async deleteGiftCard(giftCardId) {
        if (!giftCardId) {
            throw new Error('Gift card ID is required')
        }

        try {
            const response = await api.delete(`/gift-cards/regular?id=${giftCardId}`)

            console.log('API response:', response.data)

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete gift card')
            }

            return response.data
        } catch (error) {
            console.error('Delete gift card error:', error)
            showApiError(error, "Failed to delete gift card");
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to delete gift card')
            }
            throw error
        }
    },

    async getGiftCardById(giftCardId) {
        if (!giftCardId) {
            throw new Error('Gift card ID is required')
        }

        try {
            const response = await api.get(`/gift-cards/regular?id=${giftCardId}`)

            if (!response.data.success) {
                throw new Error(response.data.message || 'Gift card not found')
            }

            console.log('Gift card by ID response:', response.data)

            return {
                success: true,
                data: response.data.data
            }
        } catch (error) {
            console.error('Get gift card by ID error:', error)
            showApiError(error, "Failed to fetch gift card details");
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Gift card not found'
                }
            }
            throw new Error(error.response?.data?.message || 'Failed to fetch gift card details')
        }
    },

    async getGiftCardsBatchByRegularGiftCardId(regularGiftCardId) {
        if (!regularGiftCardId) {
            throw new Error('Regular gift card ID is required')
        }

        try {
            const response = await api.get(`/gift-cards?regular_gift_card_id=${regularGiftCardId}`)

            if (!response.data.success) {
                throw new Error(response.data.message || 'No gift cards found for this batch')
            }

            return {
                success: true,
                data: response.data.data || []
            }
        } catch (error) {
            console.error('Get gift cards batch by regular gift card ID error:', error)
            showApiError(error, "Failed to fetch gift cards for this batch");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch gift cards for this batch',
                data: []
            }
        }
    },

    async getGiftCardRedemptionHistory(giftCardId, { page = 1, limit = 10 } = {}) {
        if (!giftCardId) {
            throw new Error('Gift card ID is required')
        }

        try {
            const response = await api.get(`/gift-cards/redemptions?giftCardId=${giftCardId}`, {
                params: {
                    page,
                    limit
                }
            })

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch redemption history')
            }

            // Map the response data to ensure all fields are properly structured
            const mappedData = Array.isArray(response.data.data)
                ? response.data.data.map(item => ({
                    id: item.id,
                    transaction_type: item.transaction_type,
                    amount: item.amount,
                    description: item.description,
                    mobile_number: item.mobile_number,
                    created_at: item.created_at,
                    gift_card: item.gift_card ? {
                        card_number: item.gift_card.card_number,
                        card_name: item.gift_card.card_name,
                        remaining_balance: item.gift_card.remaining_balance,
                        currency: item.gift_card.currency
                    } : null
                }))
                : [];

            return {
                success: true,
                data: mappedData,
                total: response.data.total,
                page: response.data.page,
                pages: response.data.pages
            }
        } catch (error) {
            console.error('Get gift card redemption history error:', error)
            showApiError(error, "Failed to fetch redemption history");
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: 'Gift card or redemption history not found',
                    data: []
                }
            }
            throw new Error(error.response?.data?.message || 'Failed to fetch redemption history')
        }
    },

    async getBulkGiftCards({ page = 1, limit = 10, skip = 0 }) {
        try {
            const response = await api.get('/gift-cards/bulk', {
                params: {
                    page,
                    limit,
                    skip: (page - 1) * limit
                }
            })

            return {
                success: true,
                data: response.data.data || [],
                total: response.data.total,
                page: response.data.page,
                pages: response.data.pages
            }

        } catch (error) {
            console.error('Get bulk gift cards error:', error)
            showApiError(error, "Failed to fetch bulk gift cards");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch bulk gift cards',
                data: []
            }
        }
    },

    async getBulkGiftCardById(id) {
        if (!id) {
            throw new Error('Bulk gift card ID is required')
        }

        try {
            const response = await api.get(`/gift-cards/bulk?id=${id}`)

            if (!response.data.success) {
                throw new Error(response.data.message || 'Bulk gift card not found')
            }

            return {
                success: true,
                data: response.data.data && response.data.data.length > 0 ? response.data.data[0] : null
            }
        } catch (error) {
            console.error('Get bulk gift card by ID error:', error)
            showApiError(error, "Failed to fetch bulk gift card details");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch bulk gift card details',
                data: null
            }
        }
    },

    async getGiftCardsBatchByBulkGiftCardId(bulkGiftCardId) {
        if (!bulkGiftCardId) {
            throw new Error('Bulk gift card ID is required')
        }

        try {
            const response = await api.get(`/gift-cards?bulk_gift_card_id=${bulkGiftCardId}`)

            if (!response.data.success) {
                throw new Error(response.data.message || 'No gift cards found for this batch')
            }

            return {
                success: true,
                data: response.data.data || []
            }
        } catch (error) {
            console.error('Get gift cards batch by bulk gift card ID error:', error)
            showApiError(error, "Failed to fetch gift cards for this batch");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch gift cards for this batch',
                data: []
            }
        }
    },

    async downloadGiftCardsCsv(batchId) {
        if (!batchId) {
            throw new Error('Batch ID is required for downloading CSV')
        }

        try {
            // Set responseType to 'blob' to handle file download
            const response = await api.get(`/gift-cards/download?batch_id=${batchId}`, {
                responseType: 'blob'
            })

            // Create a URL for the blob and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `gift-cards-${batchId}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()

            return {
                success: true,
                message: 'CSV file downloaded successfully'
            }
        } catch (error) {
            console.error('Download CSV error:', error)
            showApiError(error, "Failed to download gift cards CSV");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to download gift cards CSV'
            }
        }
    },

    async deleteBulkGiftCardsByBatchId(batchId) {
        if (!batchId) {
            throw new Error('Batch ID is required')
        }

        try {
            const response = await api.delete(`/gift-cards/bulk?batch_id=${batchId}`)

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete bulk gift cards')
            }

            return {
                success: true,
                message: response.data.message || 'Bulk gift cards deleted successfully'
            }
        } catch (error) {
            console.error('Delete bulk gift cards error:', error)
            showApiError(error, "Failed to delete bulk gift cards");
            throw new Error(error.response?.data?.message || 'Failed to delete bulk gift cards')
        }
    },

    async getGiftCardTransactions({ page = 1, limit = 10 } = {}) {
        try {
            const response = await api.get('/gift-cards/redemptions', {
                params: {
                    page,
                    limit,
                    offset: (page - 1) * limit
                }
            })

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch gift card transactions')
            }

            // Map the response data to ensure all fields are properly structured
            const mappedData = Array.isArray(response.data.data)
                ? response.data.data.map(item => ({
                    id: item.id,
                    transaction_type: item.transaction_type,
                    amount: item.amount,
                    remaining_balance: item.remaining_balance,
                    description: item.description,
                    mobile_number: item.mobile_number,
                    created_at: item.created_at,
                    gift_card: item.gift_card ? {
                        card_number: item.gift_card.card_number,
                        card_name: item.gift_card.card_name,
                        remaining_balance: item.gift_card.remaining_balance,
                        currency: item.gift_card.currency
                    } : null
                }))
                : [];

            return {
                success: true,
                data: mappedData,
                total: response.data.total || 0,
                page: response.data.page || page,
                pages: response.data.pages || Math.ceil((response.data.total || 0) / limit)
            }
        } catch (error) {
            console.error('Error fetching gift card transactions:', error)
            showApiError(error, "Failed to fetch gift card transactions");
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to fetch gift card transactions',
                data: [],
                total: 0,
                pages: 1,
                page: page
            }
        }
    }
}


// import api from './api'

// export const giftCardService = {
//     async getAllGiftCards(page = 1, limit = 10, searchParams = {}) {
//         try {
//             const response = await api.get('/gift-cards', {
//                 params: {
//                     page,
//                     limit,
//                     ...searchParams
//                 }
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to fetch gift cards')
//             }

//             return {
//                 success: true,
//                 data: response.data.data || [],
//                 total: response.data.total || 0,
//                 pages: response.data.pages || 1,
//                 page: response.data.page || page
//             }
//         } catch (error) {
//             console.error('Error fetching gift cards:', error)
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Failed to fetch gift cards',
//                 data: [],
//                 total: 0,
//                 pages: 1,
//                 page: page
//             }
//         }
//     },

//     async getCurrency() {
//         try {
//             const response = await api.get('/country')

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to fetch currencies')
//             }

//             // Filter and transform data
//             const filteredCurrencies = response.data.data
//                 .filter(item => {
//                     return item?.id &&
//                         typeof item.id === 'number' &&
//                         item?.currency &&
//                         typeof item.currency === 'string' &&
//                         item.currency.trim().length === 3 &&
//                         /^[A-Za-z]{3}$/.test(item.currency)
//                 })
//                 .map(item => ({
//                     id: item.id,
//                     currency: item.currency.toUpperCase()
//                 }))
//                 .filter((item, index, self) =>
//                     index === self.findIndex(t =>
//                         t.id === item.id && t.currency === item.currency
//                     )
//                 )

//             return filteredCurrencies.sort((a, b) => a.id - b.id)
//         } catch (error) {
//             console.error('Error fetching currencies:', error)
//             throw new Error(error.response?.data?.message || 'Failed to fetch currencies')
//         }
//     },

//     async giftCardList() {
//         try {
//             const response = await api.get('/gift-cards/search')

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to fetch gift card list')
//             }

//             return {
//                 success: true,
//                 data: response.data.data || []
//             }
//         } catch (error) {
//             console.error('Error fetching gift card list:', error)
//             return {
//                 success: false,
//                 data: [],
//                 message: error.response?.data?.message || 'Failed to fetch gift card list'
//             }
//         }
//     },

//     async createGiftCard(formData) {
//         try {
//             const response = await fetch('/api/gift-cards', {
//                 method: 'POST',
//                 body: formData, // Send FormData directly
//                 // Remove headers since FormData sets its own Content-Type
//             })

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`)
//             }

//             return await response.json()
//         } catch (error) {
//             console.error('Create gift card error:', error)
//             throw error
//         }
//     },

//     async updateGiftCard(giftCardId, formData) {
//         if (!giftCardId) {
//             throw new Error('Gift card ID is required')
//         }

//         if (!(formData instanceof FormData)) {
//             throw new Error('Data must be FormData')
//         }

//         try {
//             const response = await api.put('/gift-cards', formData, {
//                 params: { id: giftCardId },
//                 headers: {
//                     'Accept': 'application/json'
//                 },
//                 transformRequest: [(data) => {
//                     if (data instanceof FormData) {
//                         return data
//                     }
//                     return JSON.stringify(data)
//                 }],
//                 maxBodyLength: Infinity,
//                 maxContentLength: Infinity
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to update gift card')
//             }

//             return response.data
//         } catch (error) {
//             console.error('Error updating gift card:', error)
//             throw new Error(error.response?.data?.message || 'Failed to update gift card')
//         }
//     },

//     async deleteGiftCard(giftCardId) {
//         if (!giftCardId) {
//             throw new Error('Gift card ID is required')
//         }

//         try {
//             const response = await api.delete('/gift-cards', {
//                 params: { id: giftCardId }
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to delete gift card')
//             }

//             return response.data
//         } catch (error) {
//             console.error('Error deleting gift card:', error)
//             throw new Error(error.response?.data?.message || 'Failed to delete gift card')
//         }
//     },

//     async getGiftCardById(giftCardIdentifier) {
//         if (!giftCardIdentifier) {
//             throw new Error('Gift card identifier is required')
//         }

//         try {
//             const response = await api.get('/gift-cards', {
//                 params: {
//                     ...(isNaN(giftCardIdentifier)
//                         ? { card_number: giftCardIdentifier }
//                         : { id: giftCardIdentifier }
//                     ),
//                     excludeFiles: true
//                 }
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to fetch gift card')
//             }

//             return response.data.data
//         } catch (error) {
//             console.error('Error fetching gift card:', error)
//             throw new Error(error.response?.data?.message || 'Failed to fetch gift card')
//         }
//     },

//     async getGiftCardMedia(giftCardId, fileField) {
//         if (!giftCardId || !fileField) {
//             throw new Error('Gift card ID and file field are required')
//         }

//         try {
//             const response = await api.get('/gift-cards/file', {
//                 params: {
//                     id: giftCardId,
//                     field: fileField
//                 }
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || `Failed to fetch gift card ${fileField}`)
//             }

//             return response.data.data
//         } catch (error) {
//             console.error(`Error fetching gift card ${fileField}:`, error)
//             throw new Error(error.response?.data?.message || `Failed to fetch gift card ${fileField}`)
//         }
//     },

//     formatMediaBase64(base64String, type = 'image/jpeg') {
//         if (!base64String || typeof base64String !== 'string') {
//             console.warn('Invalid base64 data received:', base64String)
//             return null
//         }

//         if (base64String.startsWith('data:')) {
//             return base64String
//         }

//         if (base64String.startsWith('http') || base64String.startsWith('/')) {
//             return base64String
//         }

//         return `data:${type};base64,${base64String}`
//     },

//     // Bulk gift card operations
//     async getBulkGiftCards(page = 1, limit = 10, searchParams = {}) {
//         try {
//             const response = await api.get('/gift-cards/bulk', {
//                 params: {
//                     page,
//                     limit,
//                     ...searchParams
//                 }
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to fetch bulk gift cards')
//             }

//             return {
//                 success: true,
//                 data: response.data.data || [],
//                 total: response.data.total || 0,
//                 pages: response.data.pages || 1,
//                 page: response.data.page || page
//             }
//         } catch (error) {
//             console.error('Error fetching bulk gift cards:', error)
//             return {
//                 success: false,
//                 message: error.response?.data?.message || 'Failed to fetch bulk gift cards',
//                 data: [],
//                 total: 0,
//                 pages: 1,
//                 page: page
//             }
//         }
//     },

//     async getBulkGiftCardById(bulkGiftCardId) {
//         if (!bulkGiftCardId) {
//             throw new Error('Bulk gift card ID is required')
//         }

//         try {
//             const response = await api.get('/gift-cards/bulk', {
//                 params: { id: bulkGiftCardId }
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to fetch bulk gift card')
//             }

//             return {
//                 success: true,
//                 data: response.data.data?.[0] || null
//             }
//         } catch (error) {
//             console.error('Error fetching bulk gift card:', error)
//             throw new Error(error.response?.data?.message || 'Failed to fetch bulk gift card')
//         }
//     },

//     async downloadGiftCardsCsv(batchId) {
//         if (!batchId) {
//             throw new Error('Batch ID is required for downloading CSV')
//         }

//         try {
//             const response = await api.get(`/gift-cards/download`, {
//                 params: { batch_id: batchId },
//                 responseType: 'blob'
//             })

//             const url = window.URL.createObjectURL(new Blob([response.data]))
//             const link = document.createElement('a')
//             link.href = url
//             link.setAttribute('download', `gift-cards-${batchId}.csv`)
//             document.body.appendChild(link)
//             link.click()
//             link.remove()

//             return {
//                 success: true,
//                 message: 'CSV file downloaded successfully'
//             }
//         } catch (error) {
//             console.error('Error downloading CSV:', error)
//             throw new Error(error.response?.data?.message || 'Failed to download gift cards CSV')
//         }
//     },

//     async deleteBulkGiftCardsByBatchId(batchId) {
//         if (!batchId) {
//             throw new Error('Batch ID is required')
//         }

//         try {
//             const response = await api.delete('/gift-cards/bulk', {
//                 params: { batch_id: batchId }
//             })

//             if (!response.data.success) {
//                 throw new Error(response.data.message || 'Failed to delete bulk gift cards')
//             }

//             return {
//                 success: true,
//                 message: response.data.message || 'Bulk gift cards deleted successfully'
//             }
//         } catch (error) {
//             console.error('Error deleting bulk gift cards:', error)
//             throw new Error(error.response?.data?.message || 'Failed to delete bulk gift cards')
//         }
//     }
// } 