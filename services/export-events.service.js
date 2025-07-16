import { showApiError } from '@/lib/apiErrorHandler';
import api from './api'

// Helper function to extract branch information from event payload
const extractBranchFromPayload = (payload) => {
    if (!payload) return null;

    try {
        // Handle different payload structures
        if (Array.isArray(payload)) {
            // If payload is an array, look for branch information in any of the objects
            for (const item of payload) {
                if (item && (item.Branch || item.branch)) {
                    return item.Branch || item.branch;
                }
                // Also check in Main_Data if it exists
                if (item && item.Main_Data && (item.Main_Data.Branch || item.Main_Data.branch)) {
                    return item.Main_Data.Branch || item.Main_Data.branch;
                }
            }
        } else if (typeof payload === 'object') {
            // If payload is an object, check for branch information
            if (payload.Branch || payload.branch) {
                return payload.Branch || payload.branch;
            }
            // Also check in Main_Data if it exists
            if (payload.Main_Data && (payload.Main_Data.Branch || payload.Main_Data.branch)) {
                return payload.Main_Data.Branch || payload.Main_Data.branch;
            }
        }
    } catch (error) {
        console.warn('Error extracting branch from payload:', error);
    }

    return null;
};

export const exportEventsService = {
    async getCheckEvents(page = 1, pageSize = 10, filters = {}) {
        try {
            const offset = (page - 1) * pageSize;
            const eventTypes = ['Closed Check', 'Reopen close check', 'Re adjusts check'];

            // If we have search filters, use the search API
            if (filters.search) {
                return await this.searchCheckEvents({
                    query: filters.search,
                    page: page,
                    limit: 10000, // High limit to get all search results across all pages
                    eventType: null
                });
            }

            // Use multiEventType for efficient backend filtering and pagination
            const url = `/pos-event?multiEventType=${encodeURIComponent(eventTypes.join(','))}&limit=${pageSize}&offset=${offset}`;
            const response = await api.get(url);

            // Add eventType and branch info to each event
            const events = (response.data.events || []).map(event => ({
                ...event,
                eventType: event.eventType,
                branch: extractBranchFromPayload(event.payload)
            }));

            return {
                success: true,
                total: response.data.total || events.length,
                limit: pageSize,
                offset: offset,
                events
            };
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    async searchCheckEvents({ query, page = 1, limit = 10000, eventType = null } = {}) {
        try {
            if (!query?.trim()) {
                return { success: true, events: [], total: 0 };
            }

            const trimmedQuery = query.trim();
            const eventTypes = eventType ? [eventType] : ['Closed Check', 'Reopen close check', 'Re adjusts check'];
            let allResults = [];

            // Determine if the query is ETL ID or mobile number
            const isMobileNumber = /^[\d+\-\s]+$/.test(trimmedQuery) && trimmedQuery.length >= 8;

            // Search each event type
            for (const eventTypeItem of eventTypes) {
                try {
                    const params = new URLSearchParams({
                        eventType: eventTypeItem,
                        limit: limit.toString(),
                        offset: ((page - 1) * limit).toString()
                    });

                    // Add search parameter based on query type
                    if (isMobileNumber) {
                        // Clean mobile number (remove spaces, dashes)
                        params.append('mobile', trimmedQuery.replace(/[\s\-]/g, ''));
                    } else {
                        // Treat as ETL ID
                        params.append('etlId', trimmedQuery);
                    }

                    const response = await api.get(`/pos-event?${params.toString()}`);

                    if (response.data) {
                        let events = [];
                        if (response.data.events && Array.isArray(response.data.events)) {
                            events = response.data.events;
                        } else if (Array.isArray(response.data)) {
                            events = response.data;
                        } else if (response.data && typeof response.data === 'object') {
                            events = [response.data];
                        }

                        // Add eventType and branch information to each event
                        const processedEvents = events.map(event => ({
                            ...event,
                            eventType: eventTypeItem,
                            branch: extractBranchFromPayload(event.payload)
                        }));

                        allResults.push(...processedEvents);
                    }
                } catch (eventError) {
                    console.warn(`[Export Events Service] Search failed for event type ${eventTypeItem}:`, eventError.message);
                    // Continue with other event types even if one fails
                }
            }

            // Remove duplicates based on ID and sort by date
            const uniqueResults = allResults.filter((item, index, arr) =>
                arr.findIndex(other => other.id === item.id) === index
            ).sort((a, b) => {
                return new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0);
            });

            return {
                success: true,
                events: uniqueResults,
                total: uniqueResults.length
            };
        } catch (error) {
            showApiError(error, "Failed to search check events");
            console.error('[Export Events Service] Search check events error:', {
                error: error.message,
                response: error.response?.data,
                stack: error.stack,
                query
            });
            throw new Error(error.response?.data?.message || 'Failed to search check events');
        }
    },

    async getReservations(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const response = await api.get(`/pos-event?eventType=Reservation Completed&limit=${pageSize}&offset=${offset}`);

            // Add branch information to each event
            if (response.data && response.data.events) {
                response.data.events = response.data.events.map(event => ({
                    ...event,
                    branch: extractBranchFromPayload(event.payload)
                }));
            }

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    async getSalesGiftCard(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const response = await api.get(`/pos-event?eventType=Sales Gift Card&limit=${pageSize}&offset=${offset}`);

            // Add branch information to each event
            if (response.data && response.data.events) {
                response.data.events = response.data.events.map(event => ({
                    ...event,
                    branch: extractBranchFromPayload(event.payload)
                }));
            }

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    async getGiftCardRedeem(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const response = await api.get(`/pos-event?eventType=Gift Card Redeemed&limit=${pageSize}&offset=${offset}`);

            // Add branch information to each event
            if (response.data && response.data.events) {
                response.data.events = response.data.events.map(event => ({
                    ...event,
                    branch: extractBranchFromPayload(event.payload)
                }));
            }

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    async getWalletRedeem(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const response = await api.get(`/pos-event?eventType=Wallet Redeemed&limit=${pageSize}&offset=${offset}`);

            // Add branch information to each event
            if (response.data && response.data.events) {
                response.data.events = response.data.events.map(event => ({
                    ...event,
                    branch: extractBranchFromPayload(event.payload)
                }));
            }

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    async getPointRedeem(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const eventType = 'Point Redeemed';
            const url = `/pos-event?eventType=${encodeURIComponent(eventType)}&limit=${pageSize}&offset=${offset}`;

            console.log('Fetching point redemption events:', url);

            try {
                // Make the API call with a timeout
                const response = await Promise.race([
                    api.get(url),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Request timeout after 10s')), 10000)
                    )
                ]);

                // Log the raw response
                console.log('Raw API response:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    data: response.data ? 'Data received' : 'No data',
                    dataType: typeof response.data,
                    isArray: Array.isArray(response.data)
                });

                // If we get here, we have a response
                if (!response) {
                    throw new Error('No response object received from server');
                }

                // Check for empty or invalid response data
                if (!response.data) {
                    console.warn('Response data is empty or undefined');
                    return {
                        total: 0,
                        pages: 0,
                        events: [],
                        limit: pageSize,
                        offset: offset
                    };
                }


                // Handle different response formats
                let events = [];
                let total = 0;

                // Case 1: Response has events array and total
                if (response.data.events && Array.isArray(response.data.events)) {
                    events = response.data.events.map(event => ({
                        ...event,
                        branch: extractBranchFromPayload(event.payload)
                    }));
                    total = typeof response.data.total === 'number' ? response.data.total : events.length;
                }
                // Case 2: Response is directly an array
                else if (Array.isArray(response.data)) {
                    events = response.data.map(event => ({
                        ...event,
                        branch: extractBranchFromPayload(event.payload)
                    }));
                    total = events.length;
                }
                // Case 3: Response is a single event object
                else if (response.data && typeof response.data === 'object') {
                    events = [{
                        ...response.data,
                        branch: extractBranchFromPayload(response.data.payload)
                    }];
                    total = 1;
                }
                // Case 4: Unexpected format, log warning and return empty
                else {
                    console.warn('Unexpected response format:', response.data);
                    return {
                        total: 0,
                        pages: 0,
                        events: [],
                        limit: pageSize,
                        offset: offset
                    };
                }

                // Log processed data
                console.log('Processed events:', {
                    total,
                    eventsCount: events.length,
                    eventsSample: events.length > 0 ? events[0] : 'No events'
                });

                // Return the data in a consistent format
                return {
                    total,
                    pages: Math.ceil(total / pageSize) || 1,
                    events: events,
                    limit: pageSize,
                    offset: offset
                };

            } catch (apiError) {
                console.error('API call failed:', {
                    name: apiError.name,
                    message: apiError.message,
                    stack: apiError.stack,
                    ...(apiError.config && {
                        config: {
                            url: apiError.config.url,
                            method: apiError.config.method,
                            headers: apiError.config.headers,
                            params: apiError.config.params
                        }
                    }),
                    ...(apiError.response && {
                        response: {
                            status: apiError.response.status,
                            statusText: apiError.response.statusText,
                            data: apiError.response.data,
                            headers: apiError.response.headers
                        }
                    })
                });

                // Rethrow with more context
                const error = new Error(apiError.message || 'Failed to fetch point redemption events');
                error.name = apiError.name || 'APIError';
                error.status = apiError.response?.status;
                error.data = apiError.response?.data;
                throw error;
            }

        } catch (error) {
            console.error('Error in getPointRedeem:', {
                name: error.name,
                message: error.message,
                status: error.status,
                stack: error.stack,
                data: error.data
            });

            // Show user-friendly error message
            showApiError(error, error.message || "Failed to fetch point redemption events. Please try again later.");

            // Return a valid empty response
            return {
                total: 0,
                pages: 0,
                events: [],
                limit: pageSize,
                offset: (page - 1) * pageSize
            };
        }
    },

    async getPointEarn(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const response = await api.get(`/pos-event?eventType=Point Earn&limit=${pageSize}&offset=${offset}`);

            // Add branch information to each event
            if (response.data && response.data.events) {
                response.data.events = response.data.events.map(event => ({
                    ...event,
                    branch: extractBranchFromPayload(event.payload)
                }));
            }

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    async getDiscountRedeem(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const response = await api.get(`/pos-event?eventType=Discount Rule Redeemed&limit=${pageSize}&offset=${offset}`);

            // Add branch information to each event
            if (response.data && response.data.events) {
                response.data.events = response.data.events.map(event => ({
                    ...event,
                    branch: extractBranchFromPayload(event.payload)
                }));
            }

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    async getDiscountCode(page = 1, pageSize = 10) {
        try {
            const offset = (page - 1) * pageSize;
            const response = await api.get(`/pos-event?eventType=Discount Code Redeemed&limit=${pageSize}&offset=${offset}`);

            // Add branch information to each event
            if (response.data && response.data.events) {
                response.data.events = response.data.events.map(event => ({
                    ...event,
                    branch: extractBranchFromPayload(event.payload)
                }));
            }

            return response.data;
        } catch (error) {
            showApiError(error, "Failed to fetch events");
            console.error('Error fetching events:', error);
            throw error;
        }
    },
}