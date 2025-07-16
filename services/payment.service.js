import { showApiError } from '@/lib/apiErrorHandler';
import api from './api';

export const paymentService = {
  /**
   * Initialize a payment checkout with HyperPay
   * @param {Object} paymentData - Payment data
   * @param {string} currentPath - Current path for return URL
   * @returns {Promise<Object>} - Response with checkout details
   */
  async initializePayment(paymentData, currentPath) {
    try {
      if (!paymentData?.reservation_id) {
        throw new Error('Reservation ID is required');
      }

      const response = await api.post('/payments/checkout', {
        reservation_id: paymentData.reservation_id,
        payment_brand: paymentData.payment_brand || 'VISA',
        currentPath // Add current path for return URL
      });

      if (!response.data?.checkoutId) {
        throw new Error('Failed to get checkout ID');
      }

      // Return more comprehensive payment details
      return {
        success: true,
        checkoutId: response.data.checkoutId,
        amount: response.data.amount,
        currency: response.data.currency,
        payment: response.data.payment,
        scriptUrl: response.data.scriptUrl,
        merchantTransactionId: response.data.merchantTransactionId,
        brands: response.data.brands || ['VISA', 'MADA'] // Available payment brands
      };
    } catch (error) {
      showApiError(error, "Failed to initialize payment");
      console.error('Payment initialization error:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message
      };
    }
  },

  /**
   * Check payment status with HyperPay
   * @param {string} checkoutId - HyperPay checkout ID
   * @param {string} resourcePath - HyperPay resource path from redirect
   * @returns {Promise<Object>} - Payment status response
   */
  async checkPaymentStatus(checkoutId, resourcePath) {
    try {
      if (!checkoutId) {
        throw new Error('Checkout ID is required');
      }

      // Log the request details
      console.log(`Checking payment status for checkoutId: ${checkoutId}`);

      // For status check, we need to ensure only the base path is sent
      let cleanResourcePath = null;
      
      if (resourcePath) {
        console.log('Original resourcePath:', resourcePath);
        
        // Extract just the base path, removing ALL parameters
        // First decode to handle URL encoding
        const decodedPath = decodeURIComponent(resourcePath);
        
        // Remove any query parameters (anything after ?)
        let pathWithoutQuery = decodedPath.split('?')[0];
        
        // HyperPay sometimes embeds parameters directly in the path segments
        // Let's strip out any path segment containing a parameter
        const pathSegments = pathWithoutQuery.split('/');
        const cleanSegments = pathSegments.filter(segment => 
          !segment.includes('=') && 
          !segment.includes('paymentBrand') && 
          !segment.includes('shopperResultUrl')
        );
        
        // Reassemble the clean path
        cleanResourcePath = cleanSegments.join('/');
        
        // Make sure we have the checkoutId and 'payment' in the path
        // If missing, construct a standard path
        if (!cleanResourcePath.includes(checkoutId) || !cleanResourcePath.includes('payment')) {
          cleanResourcePath = `v1/checkouts/${checkoutId}/payment`;
        }
        
        console.log('Thoroughly cleaned resourcePath:', cleanResourcePath);
      }
      
      // Fix the endpoint URL to use the dynamic route
      const response = await api.get(`/payments/status/${checkoutId}`, {
        params: cleanResourcePath ? { resourcePath: cleanResourcePath } : {}
      });

      console.log('Payment status response:', response.data);

      // Handle expired status
      if (response.data.status === 'EXPIRED') {
        return {
          success: false,
          payment: response.data.payment,
          status: 'EXPIRED',
          message: 'Your payment session has expired. Please try again.',
          code: response.data.code
        };
      }

      // Handle invalid parameter errors
      if (response.data.hyperPayStatus?.result?.code === '200.300.404') {
        return {
          success: false,
          payment: response.data.payment,
          status: 'FAILED',
          message: 'Invalid payment parameters. Please try again.',
          code: response.data.hyperPayStatus.result.code
        };
      }

      return {
        success: response.data.success,
        payment: response.data.payment,
        status: response.data.status,
        message: response.data.message,
        hyperPayStatus: response.data.hyperPayStatus
      };
    } catch (error) {
      showApiError(error, "Failed to check payment status");
      console.error('Payment status check error:', error);
      const errorData = error.response?.data;
      return {
        success: false,
        status: errorData?.status || 'ERROR',
        message: errorData?.message || error.message || 'Failed to check payment status',
        code: errorData?.code
      };
    }
  },

  /**
   * Get payment details
   * @param {string} checkoutId - HyperPay checkout ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPaymentDetails(checkoutId) {
    try {
      // Update to use the same endpoint pattern as checkPaymentStatus
      const response = await api.get(`/payments/status/${checkoutId}`);
      
      // Check if response contains valid payment data
      if (!response.data?.payment) {
        return {
          success: false,
          message: 'No payment details found'
        };
      }
      
      return {
        success: true,
        payment: response.data.payment,
        status: response.data.status,
        message: response.data.message,
        mobile_number: response.data.payment?.reservation?.customer?.mobile_number,
        transactionDetails: {
          id: response.data.payment?.transaction_id,
          brand: response.data.payment?.payment_brand,
          card: {
            brand: response.data.payment?.card_brand,
            bin: response.data.payment?.card_bin,
            last4: response.data.payment?.card_last4
          }
        }
      };
    } catch (error) {
      showApiError(error, "Failed to get payment details");
      console.error('Get payment details error:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to get payment details'
      };
    }
  },

  /**
   * Capture a payment
   * @param {number} paymentId - Payment ID to capture
   * @returns {Promise<Object>} - Capture response
   */
  async capturePayment(paymentId) {
    try {
      const response = await api.post(`/payments/capture/${paymentId}`);
      console.log('Payment capture response:', response.data);

      return {
        success: true,
        capturePayment: response.data?.capturePayment,
        message: 'Payment captured successfully'
      };
    } catch (error) {
      showApiError(error, "Failed to capture payment");
      console.error('Payment capture error:', error);
      return {
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to capture payment'
      };
    }
  },

  /**
   * Refund a payment
   * @param {number} paymentId - Payment ID to refund
   * @param {Object} amount - Refund amount (optional)
   * @returns {Promise<Object>} - Refund response
   */
  async refundPayment(paymentId, amount) {
    try {
      const response = await api.post(`/payments/refund/${paymentId}`, { amount });
      console.log('Payment refund response:', response.data);

      return {
        success: true,
        refundPayment: response.data?.refundPayment,
        message: 'Payment refunded successfully'
      };
    } catch (error) {
      showApiError(error, "Failed to refund payment");
      console.error('Payment refund error:', error);
      return {  
        success: false,
        message: error.response?.data?.error || error.message || 'Failed to refund payment'
      };
    }
  }
};