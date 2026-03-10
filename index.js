const EnggEnvAPI = require('./enggEnvAPI');
const SurveykshanAPI = require('./surveykshanAPI');
const deviceMapping = require('./deviceMapping.json');
require('dotenv').config();

class DataForwarder {
  constructor() {
    this.enggEnvAPI = new EnggEnvAPI();
    this.surveykshanAPI = new SurveykshanAPI();
    this.mapping = deviceMapping.deviceMapping;
    this.settings = deviceMapping.settings;
  }

  async forwardDeviceData(enggDeviceId) {
    try {
      const mapping = this.mapping[enggDeviceId];
      if (!mapping || !mapping.enabled) {
        return;
      }

      // Fetch data from EnggEnv server
      const allData = await this.enggEnvAPI.getAllDeviceData(enggDeviceId);

      // Forward device data to Surveykshan only
      if (allData.data) {
        await this.surveykshanAPI.sendData(mapping.surveykshanId, allData.data);
      }
    } catch (error) {
      console.error(`✗ Device ${enggDeviceId} failed:`, error.message);
    }
  }

  async forwardAllDevices() {
    console.log(`🔄 Forwarding data for ${Object.keys(this.mapping).filter(d => this.mapping[d].enabled).length} devices...`);

    const enabledDevices = Object.keys(this.mapping).filter(deviceId => this.mapping[deviceId].enabled);

    for (const deviceId of enabledDevices) {
      await this.forwardDeviceData(deviceId);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('✅ Cycle complete');
  }

  start() {
    console.log('🚀 Surveykshan Forwarder started (12min intervals)');

    // Run immediately on start
    this.forwardAllDevices();

    // Set up interval for periodic forwarding
    setInterval(() => {
      this.forwardAllDevices();
    }, this.settings.fetchInterval);
  }

  async testSingleDevice(deviceId) {
    console.log(`Testing single device: ${deviceId}`);
    await this.forwardDeviceData(deviceId);
  }
}

// CLI interface
if (require.main === module) {
  const forwarder = new DataForwarder();

  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Start continuous forwarding
    forwarder.start();
  } else if (args[0] === 'test' && args[1]) {
    // Test single device
    forwarder.testSingleDevice(args[1]).then(() => {
      console.log('Test completed');
      process.exit(0);
    }).catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage:');
    console.log('  node index.js                    # Start continuous forwarding');
    console.log('  node index.js test <deviceId>    # Test single device');
    process.exit(1);
  }
}

module.exports = DataForwarder;
