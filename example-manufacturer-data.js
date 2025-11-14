import BLEPeripheral from 'react-native-ble-peripheral';

// Example usage of Manufacturer Data feature (Android only)

class BLEPeripheralManufacturerDataExample {
  constructor() {
    this.serviceUUID = '12345678-1234-1234-1234-123456789ABC';
    this.characteristicUUID = '87654321-4321-4321-4321-CBA987654321';
    // Manufacturer ID - common IDs: 0x004C (Apple), 0x0006 (Microsoft), etc.
    // Use your own manufacturer ID or a test ID (0xFFFF is often used for testing)
    this.manufacturerId = 0xFFFF;
  }

  async setupBLEWithManufacturerData() {
    try {
      console.log('Setting up BLE with Manufacturer Data...');

      // Set device name
      await BLEPeripheral.setName('My BLE Gateway');
      console.log('✅ Device name set');

      // Set manufacturer data BEFORE starting advertising
      // Manufacturer data is an array of bytes (0-255)
      const manufacturerData = [
        0x01, 0x02, 0x03, 0x04, 0x05  // Example data: 5 bytes
      ];
      
      await BLEPeripheral.setManufacturerData(this.manufacturerId, manufacturerData);
      console.log('✅ Manufacturer data set:', {
        manufacturerId: this.manufacturerId,
        data: manufacturerData
      });

      // Add a primary service
      await BLEPeripheral.addService(this.serviceUUID, true);
      console.log('✅ Service added');

      // Add a characteristic
      await BLEPeripheral.addCharacteristicToService(
        this.serviceUUID,
        this.characteristicUUID,
        2 | 16, // read and write permissions
        2 | 8,  // read and write properties
        'Initial data'
      );
      console.log('✅ Characteristic added');

      // Start advertising (will include manufacturer data)
      const result = await BLEPeripheral.start();
      console.log('✅ BLE advertising started with manufacturer data:', result);

    } catch (error) {
      console.error('❌ Error setting up BLE:', error);
      throw error;
    }
  }

  async updateManufacturerData(newData) {
    try {
      console.log('Updating manufacturer data...');
      
      // Update manufacturer data while advertising
      // This will automatically stop and restart advertising with new data
      const result = await BLEPeripheral.updateManufacturerData(
        this.manufacturerId,
        newData
      );
      
      console.log('✅ Manufacturer data updated:', result);
      console.log('New data:', newData);
    } catch (error) {
      console.error('❌ Error updating manufacturer data:', error);
      throw error;
    }
  }

  // Example: Update manufacturer data with gateway information
  async updateGatewayData(gatewayId, status) {
    try {
      // Example: Encode gateway ID and status in manufacturer data
      // Format: [gatewayId (2 bytes), status (1 byte)]
      const gatewayIdBytes = [
        (gatewayId >> 8) & 0xFF,  // High byte
        gatewayId & 0xFF           // Low byte
      ];
      const statusByte = status ? 0x01 : 0x00;
      
      const manufacturerData = [...gatewayIdBytes, statusByte];
      
      await this.updateManufacturerData(manufacturerData);
      console.log(`✅ Gateway data updated - ID: ${gatewayId}, Status: ${status}`);
    } catch (error) {
      console.error('❌ Error updating gateway data:', error);
      throw error;
    }
  }

  async stopBLE() {
    try {
      await BLEPeripheral.stop();
      console.log('✅ BLE advertising stopped');
    } catch (error) {
      console.error('❌ Error stopping BLE:', error);
      throw error;
    }
  }
}

// Usage example:
const example = new BLEPeripheralManufacturerDataExample();

// Setup and start advertising with manufacturer data
example.setupBLEWithManufacturerData()
  .then(() => {
    console.log('BLE started successfully with manufacturer data');
    
    // After 5 seconds, update the manufacturer data
    setTimeout(() => {
      example.updateManufacturerData([0xAA, 0xBB, 0xCC, 0xDD]);
    }, 5000);
    
    // Update with gateway information
    setTimeout(() => {
      example.updateGatewayData(1234, true);
    }, 10000);
  })
  .catch(error => {
    console.error('Failed to setup BLE:', error);
  });

export default BLEPeripheralManufacturerDataExample;

