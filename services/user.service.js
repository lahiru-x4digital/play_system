import api from './api'
import { emailService } from './email.service'

export const userService = {
  /**
   * Login user
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   */
  async login(credentials) {
    try {
      // Ensure we have the required fields
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      const response = await api.post("play/auth/login", {
        email: credentials.email.toLowerCase(),
        password: credentials.password,
      });

      const data = response.data;

      // Validate response data
      if (!data || !data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      // Log the response for debugging
      console.log('Login response:', response.data);

      // Check if OTP is part of the response
      const otpRequired = data.user?.otp || false;

      // Return user and token, with branch information
      return {
        user: {
          id: data.user?.id || '1',
          email: data.user?.email || credentials.email,
          name: data.user?.name || 'User',
          user_type: data.user?.user_type || 'USER',
          branchId: data.user?.branchId,
          branch: data.user?.branch,
          otpRequired,
          is2fa: data.user?.is2fa,
        },
        token: data.token
      };
    } catch (error) {
      // Enhanced error logging
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Provide a meaningful error message
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  /**
   * Verify OTP
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.otp
   */
  async verifyOTP({ email, otp }) {
    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      const data = response.data;

      // Validate response data
      if (!data) {
        throw new Error("Invalid response from server");
      }

      return {
        success: data.success || false,
        message: data.message || "OTP verification completed"
      };
    } catch (error) {
      console.error("OTP verification error:", error);

      // Handle network errors specifically
      if (error.code === "ERR_NETWORK") {
        throw new Error("Network error - please check your connection");
      }

      throw new Error(error.response?.data?.message || "OTP verification failed");
    }
  },

  /**
   * Resend OTP by logging in again
   * @param {Object} params
   * @param {string} params.email - User's email address
   * @param {string} params.password - User's password
   * @returns {Promise<Object>} Response containing success status and message
   */
  async resendOTP({ email, password }) {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      console.log('Attempting to login to get new OTP for email:', email);

      // Use the login endpoint which should return a new OTP
      const response = await api.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password: password
      });

      console.log('Login response for OTP resend:', response.data);

      // Check if the response indicates OTP is required
      if (!response.data || !response.data.user?.otp) {
        console.error('No OTP in login response:', response.data);
        throw new Error("Failed to get new OTP. Please try again.");
      }

      return {
        success: true,
        message: "New OTP has been sent to your email"
      };
    } catch (error) {
      console.error("Resend OTP error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });

      // Handle network errors
      if (error.code === "ERR_NETWORK") {
        throw new Error("Network error - please check your connection");
      }

      // Handle 401 (Unauthorized) specifically
      if (error.response?.status === 401) {
        throw new Error("Invalid email or password");
      }

      // Handle 500 errors specifically
      if (error.response?.status === 500) {
        throw new Error("Server error - please try again later");
      }

      // Use server error message if available, otherwise a generic one
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to get new OTP. Please try again.";

      throw new Error(errorMessage);
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(token) {
    try {
      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Get user error:', error)
      throw error
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      if (!id) {
        throw new Error("User ID is required");
      }

      const response = await api.get(`/user?id=${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user data');
      }

      return {
        success: true,
        data: response.data.data,
        message: 'User data fetched successfully'
      };
    } catch (error) {
      console.error("Get user by ID error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch user data'
      };
    }
  },

  /**
   * Logout user
   */
  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Response containing success status and message
   */
  async requestPasswordReset(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const response = await api.post("/auth/forgot-password", {
        email: email.toLowerCase()
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error("Password reset request error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      throw new Error(error.response?.data?.message || "Password reset request failed");
    }
  },

  /**
   * Reset password using reset token
   * @param {Object} params
   * @param {string} params.token - Reset token from email
   * @param {string} params.newPassword - New password to set
   * @returns {Promise<Object>} Response containing success status and message
   */
  async resetPassword({ token, newPassword }) {
    try {
      if (!token || !newPassword) {
        throw new Error("Token and new password are required");
      }

      const response = await api.post("/auth/reset-password", {
        token,
        newPassword
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error("Password reset error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  },


  async getUsers({ page = 1, limit = 10, skip = 0, user_type = null }) {
    try {
      console.log('Fetching users with params:', { page, limit, skip, user_type });

      const params = {
        page,
        limit,
        skip: (page - 1) * limit
      };

      // Add user_type parameter if provided
      if (user_type) {
        params.user_type = user_type;
      }

      const response = await api.get(`/user`, { params });
      console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch users');
      }

      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages
      };
    } catch (error) {
      console.error("Get users error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
  },

  /**
   * Get users by user type with optional ID filtering
   * @param {Object} params
   * @param {string} params.user_type - The user type to filter by (ADMIN, SUPERADMIN, etc.)
   * @param {string|number} [params.userId] - Optional user ID to filter by
   * @param {number} [params.page=1] - Page number for pagination
   * @param {number} [params.limit=10] - Number of items per page
   * @returns {Promise<Object>} Response containing filtered users
   */
  async getUsersByType({ user_type, userId = null, page = 1, limit = 10 }) {
    try {
      console.log('Fetching users by type with params:', { user_type, userId, page, limit });

      const params = {
        user_type,
        page,
        limit,
        skip: (page - 1) * limit
      };

      // Add user ID filter if provided
      if (userId) {
        params.id = userId;
      }

      const response = await api.get(`/user`, { params });
      console.log('API response for getUsersByType:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch users by type');
      }

      // Filter users by ID on the client side if needed (additional safety)
      let users = response.data.data?.users || response.data.data || [];

      if (userId && Array.isArray(users)) {
        users = users.filter(user => user.id == userId || user.user_id == userId);
      }

      return {
        success: true,
        data: {
          users: users,
          total: response.data.total || users.length,
          page: response.data.page || page,
          pages: response.data.pages || Math.ceil((response.data.total || users.length) / limit)
        }
      };
    } catch (error) {
      console.error("Get users by type error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || "Failed to fetch users by type");
    }
  },

  /**
   * Create a new user and send welcome email
   * @param {Object} userData - User data including email, password, etc.
   * @returns {Promise<Object>} Response containing success status and created user data
   */
  async createUser(userData) {
    try {
      console.log('Creating user with data:', userData);

      const formattedData = Object.fromEntries(
        Object.entries(userData)
          .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      );

      console.log('Sending formatted data:', formattedData);

      // Create the user
      const response = await api.post('/user', formattedData);
      console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create user');
      }

      // The API returns an array of successful users in data.successful
      const createdUsers = response.data.data?.successful || [];
      const createdUser = createdUsers[0] || {}; // Get the first created user or empty object

      console.log('[User Service] Created user data:', JSON.stringify(createdUser));

      // Send welcome email with credentials using the submitted email (which we know is valid)
      // We're using userData.email since that's guaranteed to exist
      if (userData.email) {
        console.log('[User Service] Preparing to send welcome email for user:', userData.email);
        try {
          // Get brand and branch names if available
          let brandName = '';
          let branchName = '';

          // Try to get brand name from form data or from API
          if (userData.brand_id) {
            try {
              // Check if we can get brand name from brandService
              const brandService = await import('./brand.service').then(module => module.brandService);
              console.log(`[User Service] Fetching all brands to find brand ID: ${userData.brand_id}`);
              const brandsResponse = await brandService.getAllBrands();

              if (brandsResponse?.success && Array.isArray(brandsResponse.data)) {
                const brand = brandsResponse.data.find(b => b.id.toString() === userData.brand_id.toString());
                if (brand) {
                  brandName = brand.brand_name || brand.name || '';
                  console.log(`[User Service] Found brand: ${brandName}`);
                }
              }
            } catch (brandError) {
              console.warn('[User Service] Failed to fetch brand details:', {
                error: brandError.message,
                brandId: userData.brand_id
              });
              // Don't throw error, just continue without brand name
            }
          }

          // Try to get branch name from form data or from API
          if (userData.branch_id) {
            try {
              // Check if we can get branch name from branchService
              const branchService = await import('./branch.service').then(module => module.branchService);
              console.log(`[User Service] Fetching all branches to find branch ID: ${userData.branch_id}`);
              const branchesResponse = await branchService.getAllBranches();

              if (branchesResponse?.success && Array.isArray(branchesResponse.data)) {
                const branch = branchesResponse.data.find(b => b.id.toString() === userData.branch_id.toString());
                if (branch) {
                  branchName = branch.branch_name || branch.name || '';
                  console.log(`[User Service] Found branch: ${branchName}`);
                }
              }
            } catch (branchError) {
              console.warn('[User Service] Failed to fetch branch details:', {
                error: branchError.message,
                branchId: userData.branch_id
              });
              // Don't throw error, just continue without branch name
            }
          }

          console.log('[User Service] Sending welcome email with data:', {
            email: createdUser.email,
            first_name: createdUser.first_name,
            brand_name: brandName,
            branch_name: branchName
          });

          // Prepare email data
          const emailData = {
            to: userData.email, // Use explicit 'to' field as expected by the API
            subject: 'Welcome to Our Platform - Your Account Details',
            body: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
                <h2 style="color: #2563eb;">Welcome to Our Platform!</h2>
                <p>Hello ${userData.first_name || 'there'},</p>
                <p>Your account has been successfully created. Here are your login credentials:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${userData.email}</p>
                  <p style="margin: 5px 0;"><strong>Password:</strong> ${userData.password}</p>
                  ${brandName ? `<p style="margin: 5px 0;"><strong>Brand:</strong> ${brandName}</p>` : ''}
                  ${branchName ? `<p style="margin: 5px 0;"><strong>Branch:</strong> ${branchName}</p>` : ''}
                  <p>Use this url to login system dashboard <a href="https://dashboard.indpt.restroengage.com/auth">https://dashboard.indpt.restroengage.com</a></p>
                </div>
                
                <p>For security reasons, we recommend changing your password after your first login.</p>
                
                <p>Best regards,<br/>The Team</p>
              </div>
            `
          };

          console.log('[User Service] Sending direct email with data:', {
            to: emailData.to,
            subject: emailData.subject
          });

          // Send the email directly to the API endpoint
          try {
            const emailResponse = await api.post('/send-email', emailData);
            console.log('[User Service] Email API response:', emailResponse.data);

            if (emailResponse.data?.success) {
              return {
                success: true,
                data: createdUser,
                message: 'User created successfully. Welcome email has been sent.',
              };
            } else {
              console.warn('[User Service] Email API returned failure:', emailResponse.data);
              return {
                success: true,
                data: createdUser,
                message: 'User created successfully, but failed to send welcome email.',
              };
            }
          } catch (emailError) {
            console.error('[User Service] Email API error:', emailError);
            // Return success but mention email failure
            return {
              success: true,
              data: createdUser,
              message: 'User created successfully, but failed to send welcome email.',
            };
          }
        } catch (error) {
          console.error('[User Service] Error in email sending process:', error);
          // Return success but mention email failure
          return {
            success: true,
            data: createdUser,
            message: 'User created successfully, but failed to send welcome email.',
          };
        }
      }

      // If we didn't send an email, return success
      return {
        success: true,
        data: createdUser,
        message: 'User created successfully. No email was sent.'
      };
    } catch (error) {
      console.error("Create user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to create user',
        error: error.response?.data || error
      };
    }
  },

  async updateUser(id, updateData) {

    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      console.log('Updating user with data:', updateData);

      const formattedData = Object.fromEntries(
        Object.entries(updateData)
          .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      );

      console.log('Sending formatted data:', formattedData);

      const response = await api.put(`/user?id=${id}`, formattedData);
      console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user');
      }

      return {
        success: true,
        data: response.data.data,
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update user'
      };
    }
  },


  async deleteUser(id) {
    if (!id) {
      throw new Error("User ID is required");
    }

    try {
      console.log('Deleting user with ID:', id);

      const response = await api.delete(`/user?id=${id}`);
      console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }

      return {
        success: true,
        data: response.data.data,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error("Delete user error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || "Failed to delete user");
    }
  },

  async deleteUsers(userIds) {
    if (!userIds || userIds.length === 0) {
      throw new Error('User IDs are required')
    }

    try {
      console.log('Deleting users with IDs:', userIds);

      const response = await api.delete('/user', {
        data: { ids: userIds }
      });
      console.log('API response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete users');
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Users deleted successfully'
      };
    } catch (error) {
      console.error('Delete users error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete users'
      };
    }
  },
  /**
   * Change user password
   * @param {Object} params
   * @param {string} params.currentPassword - Current password for verification
   * @param {string} params.newPassword - New password to set
   * @param {string} params.confirmPassword - Confirm new password
   * @param {string} params.accessToken - JWT access token from session
   * @returns {Promise<Object>} Response containing success status and message
   */
  async changePassword({ currentPassword, newPassword, confirmPassword, accessToken }) {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("Current password, new password, and confirm password are required");
      }

      if (!accessToken) {
        throw new Error("Authorization token required. Please log in again.");
      }

      console.log('Changing password with JWT authentication');

      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Password change response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to change password');
      }

      return {
        success: true,
        message: response.data.message || 'Password changed successfully'
      };
    } catch (error) {
      console.error("Password change error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Handle network errors
      if (error.code === "ERR_NETWORK") {
        throw new Error("Network error - please check your connection");
      }

      // Handle 401 (Unauthorized) specifically
      if (error.response?.status === 401) {
        throw new Error("Unauthorized. Please log in again.");
      }

      // Handle 400 (Bad Request) for validation errors  
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Invalid password format");
      }

      // Handle 404 (Not Found)
      if (error.response?.status === 404) {
        throw new Error("User not found");
      }

      // Handle 500 (Server Error)
      if (error.response?.status === 500) {
        throw new Error("Internal server error. Please try again later.");
      }

      // Use server error message if available, otherwise a generic one
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to change password";

      throw new Error(errorMessage);
    }
  },

  /**
   * Search user by mobile number
   * @param {string} mobileNumber - Mobile number to search for
   * @returns {Promise<Object>} Response containing success status and user data
   */
  async searchUserByMobile(mobileNumber) {
    try {
      if (!mobileNumber) {
        throw new Error("Mobile number is required");
      }

      console.log('Searching user by mobile number:', mobileNumber);

      const response = await api.get('/user', {
        params: {
          mobile_number: mobileNumber.trim()
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search user');
      }

      const users = response.data.data || [];

      return {
        success: true,
        data: {
          users: users,
          total: users.length
        },
        message: users.length > 0 ? 'Users found successfully' : 'No users found'
      };
    } catch (error) {
      console.error("Search user by mobile error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to search user'
      };
    }
  },

  /**
   * Search user by email
   * @param {string} email - Email to search for
   * @returns {Promise<Object>} Response containing success status and user data
   */
  async searchUserByEmail(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      console.log('Searching user by email:', email);

      const response = await api.get('/user', {
        params: {
          email: email.trim().toLowerCase()
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search user');
      }

      const users = response.data.data || [];

      return {
        success: true,
        data: {
          users: users,
          total: users.length
        },
        message: users.length > 0 ? 'Users found successfully' : 'No users found'
      };
    } catch (error) {
      console.error("Search user by email error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Failed to search user'
      };
    }
  },

  /**
   * Enable Two-Factor Authentication for a user
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} Response containing success status
   */
  async enable2FA(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      console.log('Enabling 2FA for user ID:', userId);

      const result = await this.updateUser(userId, {
        is2fa: true
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to enable 2FA");
      }

      return {
        success: true,
        message: "Two-Factor Authentication enabled successfully"
      };
    } catch (error) {
      console.error("Enable 2FA error:", error);
      return {
        success: false,
        message: error.message || "Failed to enable 2FA"
      };
    }
  },

  /**
   * Disable Two-Factor Authentication for a user
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} Response containing success status
   */
  async disable2FA(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const result = await this.updateUser(userId, {
        is2fa: false
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to disable 2FA");
      }

      return {
        success: true,
        message: "Two-Factor Authentication disabled successfully"
      };
    } catch (error) {
      console.error("Disable 2FA error:", error);
      return {
        success: false,
        message: error.message || "Failed to disable 2FA"
      };
    }
  },

  /**
   * Get user's 2FA status
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} Response containing 2FA status
   */
  async get2FAStatus(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const result = await this.getUserById(userId);

      if (!result.success) {
        throw new Error(result.message || "Failed to get user data");
      }

      const user = result.data;
      const is2FAEnabled = user.is2fa_enabled ||
        user.two_factor_enabled ||
        user.is2fa ||
        false;

      return {
        success: true,
        data: {
          is2FAEnabled,
          backupCodes: user.backup_codes || []
        },
        message: "2FA status retrieved successfully"
      };
    } catch (error) {
      console.error("Get 2FA status error:", error);
      return {
        success: false,
        message: error.message || "Failed to get 2FA status"
      };
    }
  },
}