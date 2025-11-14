import BLEPeripheral from 'react-native-ble-peripheral';

// Example: Gateway with specific Manufacturer Data format
// Format: <0D6C> AB AA BBCC DDEE FF 77 7A17 6900 0000 00 00 00
// - 0D6C: Company ID (2 bytes)
// - AB: Packet ID (1 byte)
// - AA BBCC DDEE FF: Device name (6 bytes)
// - 77 7A17 6900 0000 00: Timestamp Unix UTC Seconds (10 bytes)
// - 00: Alert (1 byte)
// - 00: Temperature Profile (1 byte)
// Total: 21 bytes

class GatewayManufacturerDataExample {
  constructor() {
    this.serviceUUID = '12345678-1234-1234-1234-123456789ABC';
    this.companyId = 0x0D6C; // Company ID
    this.packetId = 0xAB;    // Packet ID
  }

  // Convert device name string to 6 bytes (AA BBCC DDEE FF format)
  deviceNameToBytes(deviceName) {
    // If device name is a string, convert to bytes
    // Format: AA BBCC DDEE FF (6 bytes)
    // Example: "ABCDEF" -> [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF]
    
    if (typeof deviceName === 'string') {
      const bytes = [];
      for (let i = 0; i < 6; i++) {
        if (i < deviceName.length) {
          bytes.push(deviceName.charCodeAt(i) & 0xFF);
        } else {
          bytes.push(0x00); // Pad with zeros
        }
      }
      return bytes;
    }
    // If already an array, ensure it's 6 bytes
    if (Array.isArray(deviceName)) {
      const bytes = [...deviceName];
      while (bytes.length < 6) {
        bytes.push(0x00);
      }
      return bytes.slice(0, 6);
    }
    throw new Error('Device name must be a string or array of 6 bytes');
  }

  // Convert Unix timestamp to 10 bytes (little-endian)
  timestampToBytes(timestamp) {
    // Timestamp: Unix UTC Seconds (10 bytes, little-endian)
    // Format: 77 7A17 6900 0000 00
    const bytes = [];
    let value = timestamp;
    
    // Convert to little-endian 10 bytes
    for (let i = 0; i < 10; i++) {
      bytes.push(value & 0xFF);
      value = Math.floor(value / 256);
    }
    
    return bytes;
  }

  // Build complete manufacturer data
  buildManufacturerData(deviceName, timestamp, alert = 0x00, temperatureProfile = 0x00) {
    const deviceNameBytes = this.deviceNameToBytes(deviceName);
    const timestampBytes = this.timestampToBytes(timestamp);
    
    // Build complete manufacturer data (21 bytes total)
    const manufacturerData = [
      this.packetId,           // 1 byte: Packet ID
      ...deviceNameBytes,      // 6 bytes: Device name
      ...timestampBytes,       // 10 bytes: Timestamp
      alert,                   // 1 byte: Alert
      temperatureProfile       // 1 byte: Temperature Profile
    ];
    
    if (manufacturerData.length !== 21) {
      throw new Error(`Manufacturer data must be exactly 21 bytes, got ${manufacturerData.length}`);
    }
    
    return manufacturerData;
  }

  async setupGateway() {
    try {
      console.log('Setting up BLE Gateway with Manufacturer Data...');

      // Set device name (will be available via GATT even if not in advertising)
      await BLEPeripheral.setName('My BLE Gateway');
      console.log('✅ Device name set');

      // Get current Unix timestamp
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      // Build manufacturer data with current timestamp
      const manufacturerData = this.buildManufacturerData(
        'ABCDEF',              // Device name (6 bytes)
        currentTimestamp,      // Timestamp (10 bytes)
        0x00,                  // Alert (1 byte)
        0x00                   // Temperature Profile (1 byte)
      );

      console.log('Manufacturer Data:', {
        companyId: `0x${this.companyId.toString(16).toUpperCase()}`,
        packetId: `0x${this.packetId.toString(16).toUpperCase()}`,
        deviceName: 'ABCDEF',
        timestamp: currentTimestamp,
        data: manufacturerData.map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(' ')
      });

      // Set manufacturer data
      await BLEPeripheral.setManufacturerData(this.companyId, manufacturerData);
      console.log('✅ Manufacturer data set (21 bytes)');

      // Add a primary service
      await BLEPeripheral.addService(this.serviceUUID, true);
      console.log('✅ Service added');

      // Start advertising
      const result = await BLEPeripheral.start();
      console.log('✅ BLE Gateway started:', result);
      console.log('Note: Device name may be excluded from advertising to fit 21-byte manufacturer data');

    } catch (error) {
      console.error('❌ Error setting up Gateway:', error);
      throw error;
    }
  }

  // Update manufacturer data with new timestamp (call every 30 seconds)
  async updateTimestamp() {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      // Build new manufacturer data with updated timestamp
      const manufacturerData = this.buildManufacturerData(
        'ABCDEF',              // Device name (6 bytes)
        currentTimestamp,      // Updated timestamp (10 bytes)
        0x00,                  // Alert (1 byte)
        0x00                   // Temperature Profile (1 byte)
      );

      console.log('Updating manufacturer data with new timestamp:', currentTimestamp);
      
      // Update manufacturer data (will automatically restart advertising)
      const result = await BLEPeripheral.updateManufacturerData(
        this.companyId,
        manufacturerData
      );
      
      console.log('✅ Manufacturer data updated:', result);
    } catch (error) {
      console.error('❌ Error updating manufacturer data:', error);
      throw error;
    }
  }

  // Update alert value
  async updateAlert(alertValue) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      const manufacturerData = this.buildManufacturerData(
        'ABCDEF',
        currentTimestamp,
        alertValue,            // Updated alert
        0x00
      );

      await BLEPeripheral.updateManufacturerData(this.companyId, manufacturerData);
      console.log(`✅ Alert updated to: 0x${alertValue.toString(16).toUpperCase()}`);
    } catch (error) {
      console.error('❌ Error updating alert:', error);
      throw error;
    }
  }

  // Update temperature profile
  async updateTemperatureProfile(temperatureProfile) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      const manufacturerData = this.buildManufacturerData(
        'ABCDEF',
        currentTimestamp,
        0x00,
        temperatureProfile    // Updated temperature profile
      );

      await BLEPeripheral.updateManufacturerData(this.companyId, manufacturerData);
      console.log(`✅ Temperature Profile updated to: 0x${temperatureProfile.toString(16).toUpperCase()}`);
    } catch (error) {
      console.error('❌ Error updating temperature profile:', error);
      throw error;
    }
  }

  async stopGateway() {
    try {
      await BLEPeripheral.stop();
      console.log('✅ BLE Gateway stopped');
    } catch (error) {
      console.error('❌ Error stopping Gateway:', error);
      throw error;
    }
  }
}

// Usage example:
const gateway = new GatewayManufacturerDataExample();

// Setup and start gateway
gateway.setupGateway()
  .then(() => {
    console.log('Gateway started successfully');
    
    // Update timestamp every 30 seconds
    const updateInterval = setInterval(() => {
      gateway.updateTimestamp().catch(err => {
        console.error('Failed to update timestamp:', err);
        clearInterval(updateInterval);
      });
    }, 30000); // 30 seconds
    
    // Example: Update alert after 1 minute
    setTimeout(() => {
      gateway.updateAlert(0x01).catch(err => {
        console.error('Failed to update alert:', err);
      });
    }, 60000);
    
    // Example: Update temperature profile after 2 minutes
    setTimeout(() => {
      gateway.updateTemperatureProfile(0x05).catch(err => {
        console.error('Failed to update temperature profile:', err);
      });
    }, 120000);
    
    // Stop after 5 minutes (for testing)
    setTimeout(() => {
      gateway.stopGateway();
      clearInterval(updateInterval);
    }, 300000);
  })
  .catch(error => {
    console.error('Failed to setup gateway:', error);
  });

export default GatewayManufacturerDataExample;

