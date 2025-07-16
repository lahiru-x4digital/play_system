// emailTemplateService.js
import { showApiError } from "@/lib/apiErrorHandler";
import api from "./api";

// Single base URL for all email templates
const baseUrl = '/email-template';

export const emailTemplateService = {
    getAllTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByType,
};

// Fetch all templates with pagination and optional type filter
async function getAllTemplates({ type = '', page = 1, limit = 10 } = {}) {
    try {
        const response = await api.get(baseUrl, {
            params: {
                page,
                limit,
                type
            }
        });

        // Ensure we return a valid data structure
        return {
            templates: Array.isArray(response.data.templates) ? response.data.templates : [],
            total: response.data.total || 0,
            page: response.data.page || 1,
            pages: response.data.pages || 1,
        };
    } catch (error) {
        console.error('Fetch templates error:', error);
        showApiError(error, "Failed to fetch templates");
        // Return safe default values on error
        return {
            templates: [],
            total: 0,
            page: 1,
            pages: 1,
        };
    }
}

// Fetch templates by type
async function getTemplatesByType(type) {
    try {
        const url = new URL(baseUrl, window.location.origin);
        url.searchParams.append('type', type);
        url.searchParams.append('limit', 100); // Adjust limit as needed

        const response = await api.get(url.pathname + url.search);
        return response.data.templates;
    } catch (error) {
        console.error('Fetch templates by type error:', error);
        showApiError(error, "Failed to fetch templates by type");
        throw new Error(error.response?.data?.error || 'Failed to fetch email templates by type');
    }
}

// Fetch a template by ID
async function getTemplateById(id) {
    try {
        // Since your API doesn't have a direct GET by ID endpoint,
        // we'll fetch all and filter
        const response = await api.get(baseUrl)
        const template = response.data.templates.find(t => t.id === parseInt(id))
        
        if (!template) {
            throw new Error('Template not found')
        }

        return template
    } catch (error) {
        console.error('Get template error:', error)
        showApiError(error, "Failed to fetch template");
        throw new Error(error.response?.data?.error || 'Failed to fetch template')
    }
}

// Create a new template
async function createTemplate(templateData) {
    try {
        // Validate required fields
        if (!templateData.name || !templateData.type || !templateData.subject || !templateData.html) {
            throw new Error('Missing required fields: name, type, subject, and html are required');
        }

        const payload = {
            name: templateData.name,
            type: templateData.type,
            subject: templateData.subject,
            html: templateData.html,
            design: templateData.design || null,
            header: templateData.header || null,
            body: templateData.body || null,
        };

        const response = await api.post(baseUrl, payload);

        if (!response.data) {
            throw new Error('Failed to create email template');
        }

        return response.data;
    } catch (error) {
        console.error('Create template error:', error);
        showApiError(error, "Failed to create email template");
        throw new Error(error.response?.data?.error || error.message || 'Failed to create email template');
    }
}

// Update a template
async function updateTemplate(id, templateData) {
    try {
        if (!id) {
            throw new Error('Template ID is required')
        }

        const response = await api.put(baseUrl, {
            id: parseInt(id), // Ensure ID is a number
            name: templateData.name,
            type: templateData.type,
            subject: templateData.subject,
            html: templateData.html,
            design: templateData.design || null,
            header: templateData.header || null,
            body: templateData.body || null,
        })

        return response.data
    } catch (error) {
        console.error('Update template error:', error)
        showApiError(error, "Failed to update template");
        throw new Error(error.response?.data?.error || 'Failed to update template')
    }
}

// Delete a template
async function deleteTemplate(id) {
    try {
        if (!id) {
            throw new Error('Template ID is required');
        }

        const url = new URL(baseUrl, window.location.origin);
        url.searchParams.append('id', id);

        const response = await api.delete(url.pathname + url.search);
        return response.data;
    } catch (error) {
        console.error('Delete template error:', error);
        showApiError(error, "Failed to delete email template");
        throw new Error(error.response?.data?.error || 'Failed to delete email template');
    }
}