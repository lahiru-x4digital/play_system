import api from './api'
import { showApiError } from '@/lib/apiErrorHandler'

export const emailService = {
  /**
   * Send an email with the provided data
   * @param {Object} data - Email data including to, subject, and body
   * @returns {Promise<Object>} Response from the server
   */
  async sendEmail(data) {
    console.log('[Email Service] Sending email with data:', data);
    try {
      const response = await api.post('/send-email', data);
      console.log('[Email Service] Email sent successfully:', response.data);
      
      // Return a consistent success response format
      return {
        success: true,
        data: response.data,
        message: 'Email sent successfully'
      };
    } catch (error) {
      showApiError(error, "Failed to send email");
      console.error('[Email Service] Error sending email:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Return a consistent error response format
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send email',
        error: error.response?.data || error
      };
    }
  },

  /**
   * Send welcome email with user credentials
   * @param {Object} data - User data including email, password, etc.
   * @returns {Promise<Object>} Response from the server
   */
  async sendWelcomeEmail(data) {
    console.log('[Email Service] Preparing welcome email for:', data.email);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <h2 style="color: #2563eb;">Welcome to Our Platform!</h2>
        <p>Hello ${data.first_name || 'there'},</p>
        <p>Your account has been successfully created. Here are your login credentials:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${data.password}</p>
          ${data.brand_name ? `<p style="margin: 5px 0;"><strong>Brand:</strong> ${data.brand_name}</p>` : ''}
          ${data.branch_name ? `<p style="margin: 5px 0;"><strong>Branch:</strong> ${data.branch_name}</p>` : ''}
        </div>
        
        <p>For security reasons, we recommend changing your password after your first login.</p>
        
        <p>Best regards,<br/>The Team</p>
      </div>
    `;

    const emailData = {
      to: data.email,
      subject: 'Welcome to Our Platform - Your Account Details',
      body: emailHtml,
    };

    console.log('[Email Service] Sending welcome email with data:', emailData);
    return this.sendEmail(emailData);
  },
}
