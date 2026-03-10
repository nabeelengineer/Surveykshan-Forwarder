const axios = require('axios');
require('dotenv').config();

class SurveykshanAPI {
  constructor() {
    this.baseURL = process.env.SURVEYKSHAN_API_URL;
    this.apiKey = process.env.SURVEYKSHAN_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Basic ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  async sendData(deviceId, data) {
    try {
      const formattedData = this.formatDeviceData(deviceId, data);
      const payload = {
        data: formattedData
      };

      console.log(`📤 Sending to ${deviceId}:`, JSON.stringify(payload, null, 2));

      await this.client.post('/', payload);
      console.log(`✓ Data sent: ${deviceId}`);
    } catch (error) {
      console.error(`✗ Send failed for ${deviceId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async sendConnectivityData(deviceId, connectivityData) {
    try {
      const formattedData = this.formatConnectivityData(deviceId, connectivityData);
      const payload = {
        data: formattedData
      };

      await this.client.post('', payload);
    } catch (error) {
      console.error(`✗ Connectivity failed for ${deviceId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  formatDeviceData(deviceId, data) {
    // Create the string format exactly like your example
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const timestamp = `000 ${day}/${month}/${year}---${hours}:${minutes}`;

    // Extract values from data and format with + signs
    const values = this.extractValues(data);
    const readings = values.readings.split(' ').map(v => v.startsWith('+') ? v : `+${v}`).join(' ');

    return `$${deviceId},${values.type},${timestamp} ${readings} ,Z0000,0000,0000,0000#`;
  }

  formatConnectivityData(deviceId, connectivityData) {
    // Format connectivity data into the required string format
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '/').replace(',', '---');

    const signal = connectivityData.signalStrength || '+670.03';
    const battery = connectivityData.batteryLevel || '+383.97';
    const temp = connectivityData.temperature || '+32.97';
    const humidity = connectivityData.humidity || '+42.97';

    return `$${deviceId},CS,${timestamp} ${signal} ${battery} ${temp} ${humidity},Z0000,0000,0000,0000#`;
  }

  extractValues(data) {
    // Extract ALL values from the API response
    let readings = '+0.00 +0.00 +0.00 +0.00 +0.00 +0.00 +0.00'; // default 7 values

    if (data && data.data && Array.isArray(data.data)) {
      const values = data.data.map(item => {
        const num = parseFloat(item.value);
        return isNaN(num) ? '+0.00' : `+${num.toFixed(2)}`;
      });

      if (values.length > 0) {
        readings = values.join(' ');
      }
    }

    return {
      type: 'NM',
      readings: readings
    };
  }
}

module.exports = SurveykshanAPI;
