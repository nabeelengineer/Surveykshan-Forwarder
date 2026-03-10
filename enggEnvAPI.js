const axios = require('axios');
require('dotenv').config();

class EnggEnvAPI {
  constructor() {
    this.baseURL = process.env.SERVER_BASE_URL;
    this.email = process.env.LOGIN_EMAIL;
    this.password = process.env.LOGIN_PASSWORD;
    this.token = null; // Start with null, will be set by login
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000
    });
  }

  async login() {
    try {
      const response = await this.client.post('/user/login', {
        email: this.email,
        password: this.password
      });

      this.token = response.data.token;
      return this.token;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllConnectivityDevices() {
    try {
      if (!this.token) {
        await this.login();
      }

      const response = await this.client.get('/connectivity/getConnectivityData', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      return response.data;
    } catch (error) {
      // Check if token expired and retry with new token
      if (error.response?.status === 401 && error.response?.data?.message?.includes('TokenExpiredError')) {
        console.log('🔄 Token expired, refreshing...');
        await this.login();

        // Retry the request with new token
        const response = await this.client.get('/connectivity/getConnectivityData', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        return response.data;
      }

      console.error('Connectivity devices failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getDeviceData(deviceId) {
    try {
      if (!this.token) {
        await this.login();
      }

      const response = await this.client.get('/data', {
        params: { deviceId },
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      return response.data;
    } catch (error) {
      // Check if token expired and retry with new token
      if (error.response?.status === 401 && error.response?.data?.message?.includes('TokenExpiredError')) {
        console.log('🔄 Token expired, refreshing...');
        await this.login();

        // Retry the request with new token
        const response = await this.client.get('/data', {
          params: { deviceId },
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });

        return response.data;
      }

      console.error(`Device data failed for ${deviceId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getAllDeviceData(deviceId) {
    try {
      // Get device data only
      const deviceData = await this.getDeviceData(deviceId);

      return {
        deviceId,
        timestamp: new Date().toISOString(),
        data: deviceData
      };
    } catch (error) {
      console.error(`Error fetching data for device ${deviceId}:`, error.message);
      throw error;
    }
  }
}

module.exports = EnggEnvAPI;
