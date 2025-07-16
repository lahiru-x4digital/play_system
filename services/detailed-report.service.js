import api from "./api";
import { format } from 'date-fns';
import { countryService } from './country.service';
import { brandService } from './brand.service';
import { branchService } from './branch.service';

export const closedChecksService = {
    // Cache for entity names to avoid repeated API calls
    _entityCache: {
        countries: new Map(),
        brands: new Map(),
        branches: new Map(),
        lastFetched: {
            countries: null,
            brands: null,
            branches: null
        }
    },

    // Fetch and cache countries
    async _fetchCountries() {
        try {
            const cacheAge = this._entityCache.lastFetched.countries;
            const now = Date.now();
            // Cache for 5 minutes
            if (cacheAge && (now - cacheAge) < 300000) {
                return;
            }

            const response = await countryService.getAllCountries(1, 1000);
            if (response.success && Array.isArray(response.data)) {
                this._entityCache.countries.clear();
                response.data.forEach(country => {
                    // Map both country_id and country_name for lookup
                    this._entityCache.countries.set(country.country_id?.toString(), country.country_name);
                    this._entityCache.countries.set(country.country_name?.toString(), country.country_name);
                });
                this._entityCache.lastFetched.countries = now;
                console.log('Cached countries:', this._entityCache.countries);
            }
        } catch (error) {
            console.error('Error fetching countries for cache:', error);
        }
    },

    // Fetch and cache brands
    async _fetchBrands() {
        try {
            const cacheAge = this._entityCache.lastFetched.brands;
            const now = Date.now();
            // Cache for 5 minutes
            if (cacheAge && (now - cacheAge) < 300000) {
                return;
            }

            const response = await brandService.getAllBrandsWithoutFiles();
            if (response.success && Array.isArray(response.data)) {
                this._entityCache.brands.clear();
                response.data.forEach(brand => {
                    // Map both brand_Id and brand_name for lookup
                    this._entityCache.brands.set(brand.brand_Id?.toString(), brand.brand_name);
                    this._entityCache.brands.set(brand.brand_name?.toString(), brand.brand_name);
                    // Also map by id field if it exists
                    if (brand.id) {
                        this._entityCache.brands.set(brand.id.toString(), brand.brand_name);
                    }
                });
                this._entityCache.lastFetched.brands = now;
                console.log('Cached brands:', this._entityCache.brands);
            }
        } catch (error) {
            console.error('Error fetching brands for cache:', error);
        }
    },

    // Fetch and cache branches
    async _fetchBranches() {
        try {
            const cacheAge = this._entityCache.lastFetched.branches;
            const now = Date.now();
            // Cache for 5 minutes
            if (cacheAge && (now - cacheAge) < 300000) {
                return;
            }

            const response = await branchService.getAllBranchesWithoutFiles();
            if (response.success && Array.isArray(response.data)) {
                this._entityCache.branches.clear();
                response.data.forEach(branch => {
                    // Map both branch_code and branch_name for lookup
                    this._entityCache.branches.set(branch.branch_code?.toString(), branch.branch_name);
                    this._entityCache.branches.set(branch.branch_name?.toString(), branch.branch_name);
                    // Also map by id field
                    if (branch.id) {
                        this._entityCache.branches.set(branch.id.toString(), branch.branch_name);
                    }
                });
                this._entityCache.lastFetched.branches = now;
                console.log('Cached branches:', this._entityCache.branches);
            }
        } catch (error) {
            console.error('Error fetching branches for cache:', error);
        }
    },

    // Initialize all caches
    async _initializeEntityCache() {
        await Promise.all([
            this._fetchCountries(),
            this._fetchBrands(),
            this._fetchBranches()
        ]);
    },

    // Get country name from code or ID
    _getCountryName(countryIdentifier) {
        if (!countryIdentifier) return countryIdentifier;
        const name = this._entityCache.countries.get(countryIdentifier.toString());
        return name || countryIdentifier;
    },

    // Get brand name from code or ID
    _getBrandName(brandIdentifier) {
        if (!brandIdentifier) return brandIdentifier;
        const name = this._entityCache.brands.get(brandIdentifier.toString());
        return name || brandIdentifier;
    },

    // Get branch name from code or ID
    _getBranchName(branchIdentifier) {
        if (!branchIdentifier) return branchIdentifier;
        const name = this._entityCache.branches.get(branchIdentifier.toString());
        return name || branchIdentifier;
    },

    // Enhance closed checks data with human-readable names
    async _enhanceClosedChecksWithNames(closedChecks) {
        if (!Array.isArray(closedChecks) || closedChecks.length === 0) {
            return closedChecks;
        }

        // Initialize cache if needed
        await this._initializeEntityCache();

        // Enhance each check with readable names
        return closedChecks.map(check => ({
            ...check,
            country_name: this._getCountryName(check.country),
            brand_name: this._getBrandName(check.brand),
            branch_name: this._getBranchName(check.branch),
            // Keep original codes for reference
            country_code: check.country,
            brand_code: check.brand,
            branch_code: check.branch
        }));
    },

    // Updated function for getting related events by ETL ID
    async getCheckEvents(page = 1, pageSize = 10, etlId = null, eventTypes = null) {
        try {
            if (etlId) {
                // Fetch related events for specific ETL ID using the closed checks API
                const params = new URLSearchParams();
                params.append('etl_id', etlId);
                if (eventTypes) {
                    const types = Array.isArray(eventTypes) ? eventTypes.join(',') : eventTypes;
                    params.append('event_types', types);
                }                const url = `/pos-event/detailed-report?${params.toString()}`;
                console.log("Calling related events API:", url);
                console.log("Requesting ETL ID:", etlId, "Event Types:", eventTypes);

                const response = await api.get(url);
                // console.log("API Response:", response.data);

                if (response.data && response.data.success) {
                    console.log("Successfully fetched related events:", response.data.data);
                    return {
                        success: true,
                        events_by_type: response.data.data?.events_by_type || {},
                        total_events: response.data.data?.total_events || 0
                    };
                } else {
                    console.error("API returned error:", response.data?.message);
                    throw new Error(response.data?.message || "Failed to fetch related events");
                }
            } else {
                // Fallback to original POS events API for general queries
                const offset = (page - 1) * pageSize;
                const targetEventTypes = eventTypes || ['Closed Check', 'Reopen close check', 'Re adjusts check'];
                
                // Make separate API calls for each event type to get all events
                const allPromises = targetEventTypes.map(async (eventType) => {
                    const url = `/pos-event?eventType=${encodeURIComponent(eventType)}&limit=10000000000`; // Use a large limit to get all events
                    const response = await api.get(url);
                    // Add eventType to each event for reference
                    return (response.data.events || []).map(event => ({
                        ...event,
                        eventType: eventType // Add event type to each event
                    }));
                });

                // Wait for all API calls to complete and combine results
                const allResults = await Promise.all(allPromises);
                
                // Flatten and sort events by date (newest first)
                let combinedEvents = allResults.flat().sort((a, b) => {
                    return new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0);
                });
                
                // Calculate total and apply pagination
                const total = combinedEvents.length;
                const paginatedEvents = combinedEvents.slice(offset, offset + pageSize);
                
                return {
                    total,
                    limit: pageSize,
                    offset: offset,
                    events: paginatedEvents
                };
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },
  async getClosedChecksReport(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add date parameters
      if (params.start_date)
        queryParams.append("start_date", params.start_date);
      if (params.end_date) queryParams.append("end_date", params.end_date);

      // Add filter parameters
      if (params.branch_id) queryParams.append("branch_id", params.branch_id);
      if (params.brand_id) queryParams.append("brand_id", params.brand_id);
      if (params.country_id)
        queryParams.append("country_id", params.country_id);
      if (params.check_number)
        queryParams.append("check_number", params.check_number);

      const url = `/pos-event/detailed-report?${queryParams.toString()}`;
      console.log("Calling closed checks API:", url);
      console.log("Request parameters:", params);

      const response = await api.get(url);
      console.log("Raw API response:", response);

      if (response.data && response.data.success) {
        console.log("Closed checks report data:", response.data.data);
        
        // Enhance the data with readable names
        let enhancedData = { ...response.data.data };
        if (enhancedData.closed_checks) {
          enhancedData.closed_checks = await this._enhanceClosedChecksWithNames(enhancedData.closed_checks);
        }
        
        return {
          success: true,
          data: enhancedData,
        };
      } else {
        console.error("API response indicates failure:", response.data);
        throw new Error(
          response.data?.message || "Failed to fetch closed checks report"
        );
      }
    } catch (error) {
      console.error("Error fetching closed checks report:", error);
      throw error;
    }
  },

  // Private method for making API calls to avoid code duplication
  async _fetchClosedChecksReport(startDate, endDate, filters = {}, pagination = {}) {
    try {
      // Build params object, only including non-null values
      const params = {
        start_date: startDate,
        end_date: endDate
      };

      // Add pagination parameters
      if (pagination.page) params.page = pagination.page;
      if (pagination.limit) params.limit = pagination.limit;

      // Add filters based on what's provided
      // Note: API defaults to KSA when no country_id is provided
      // Only pass country_id if explicitly specified
      if (filters.countryId && filters.countryId !== null) {
        params.country_id = filters.countryId;
      }
      if (filters.brandId) params.brand_id = filters.brandId;
      if (filters.branchId) params.branch_id = filters.branchId;
      if (filters.check_number) params.check_number = filters.check_number;

      console.log('Fetching closed checks report with params:', params);

      // Make the API call
      const response = await api.get('/pos-event/detailed-report', { params });

      console.log('Closed Checks API Response:', response.data);

      // Check if the response has the expected structure
      if (!response.data || !response.data.success) {
        console.warn('API response missing success flag or data, returning empty result');
        return { 
          success: false, 
          data: { 
            closed_checks: [], 
            summary: {},
            date_range: {},
            applied_filters: filters
          },
          total: 0,
          page: 1,
          pages: 1
        };
      }

      // Enhance closed checks data with readable names
      let enhancedData = { ...response.data.data };
      if (enhancedData.closed_checks) {
        enhancedData.closed_checks = await this._enhanceClosedChecksWithNames(enhancedData.closed_checks);
      }

      return {
        success: true,
        data: {
          ...enhancedData,
          applied_filters: filters
        },
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };

    } catch (error) {
      console.error('Get closed checks report error:', error);
      
      // Return empty result as fallback
      return { 
        success: false, 
        data: { 
          closed_checks: [], 
          summary: {},
          date_range: {},
          applied_filters: filters
        },
        total: 0,
        page: 1,
        pages: 1
      };
    }
  },

  // Real-time method - takes filters object
  async getClosedChecksReportRealtime(startDate, endDate, filters = {}, pagination = {}) {
    return this._fetchClosedChecksReport(startDate, endDate, filters, pagination);
  },

  // New method for fetching checks with events only
  async getClosedChecksWithEventsOnly(startDate, endDate, filters = {}, pagination = {}) {
    try {
      // Build params object, only including non-null values
      const params = {
        start_date: startDate,
        end_date: endDate
      };

      // Add pagination parameters
      if (pagination.page) params.page = pagination.page;
      if (pagination.limit) params.limit = pagination.limit;

      // Add filters based on what's provided
      // Note: API defaults to KSA when no country_id is provided
      // Only pass country_id if explicitly specified
      if (filters.countryId && filters.countryId !== null) {
        params.country_id = filters.countryId;
      }
      if (filters.brandId) params.brand_id = filters.brandId;
      if (filters.branchId) params.branch_id = filters.branchId;
      if (filters.check_number) params.check_number = filters.check_number;

      console.log('Fetching closed checks with events only with params:', params);

      // Make the API call to the new with-events-only endpoint
      const response = await api.get('/pos-event/detailed-report-with-events', { params });

      // console.log('Closed Checks With Events API Response:', response.data);

      // Check if the response has the expected structure
      if (!response.data || !response.data.success) {
        console.warn('API response missing success flag or data, returning empty result');
        return { 
          success: false, 
          data: { 
            closed_checks: [], 
            summary: {},
            date_range: {},
            applied_filters: filters
          },
          total: 0,
          page: 1,
          pages: 1
        };
      }

      // Enhance closed checks data with readable names
      let enhancedData = { ...response.data.data };
      if (enhancedData.closed_checks) {
        enhancedData.closed_checks = await this._enhanceClosedChecksWithNames(enhancedData.closed_checks);
      }

      return {
        success: true,
        data: {
          ...enhancedData,
          applied_filters: filters,
          filter_type: 'with_events_only'
        },
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };

    } catch (error) {
      console.error('Get closed checks with events only error:', error);
      
      // Return empty result as fallback
      return { 
        success: false, 
        data: { 
          closed_checks: [], 
          summary: {},
          date_range: {},
          applied_filters: filters,
          filter_type: 'with_events_only'
        },
        total: 0,
        page: 1,
        pages: 1
      };
    }
  },

  formatDateForAPI(date) {
    return format(new Date(date), 'yyyy-MM-dd');
  },
};