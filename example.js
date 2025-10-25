import BLEPeripheral from 'react-native-ble-peripheral';

// Example usage of the BLE Peripheral library

class BLEPeripheralExample {
  constructor() {
    this.serviceUUID = '12345678-1234-1234-1234-123456789ABC';
    this.characteristicUUID = '87654321-4321-4321-4321-CBA987654321';
  }

  async setupBLE() {
    try {
      console.log('BLEPeripheral module:', BLEPeripheral);
      console.log('Available methods:', Object.keys(BLEPeripheral));

      // Check if methods exist
      if (typeof BLEPeripheral.setName !== 'function') {
        throw new Error('setName method is not available');
      }

      // Set device name
      await BLEPeripheral.setName('My BLE Device');
      console.log('✅ Device name set');

      // Add a primary service
      await BLEPeripheral.addService(this.serviceUUID, true);
      console.log('✅ Service added');

      // Add a characteristic with read and write permissions
      await BLEPeripheral.addCharacteristicToService(
        this.serviceUUID,
        this.characteristicUUID,
        2 | 16, // read and write permissions
        2 | 8,  // read and write properties
        'Initial data'
      );
      console.log('✅ Characteristic added');

      // Start advertising
      const result = await BLEPeripheral.start();
      console.log('✅ BLE advertising started:', result);

      // Listen for events
      BLEPeripheral.addListener('onWarning', (warning) => {
        console.log('BLE Warning:', warning);
      });

    } catch (error) {
      console.error('❌ Error setting up BLE:', error);
      throw error;
    }
  }

  async sendData(data) {
    try {
      await BLEPeripheral.sendNotificationToDevices(
        this.serviceUUID,
        this.characteristicUUID,
        data
      );
      console.log('✅ Data sent:', data);
    } catch (error) {
      console.error('❌ Error sending data:', error);
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

  async checkAdvertisingStatus() {
    try {
      const isAdvertising = await BLEPeripheral.isAdvertising();
      console.log('Is advertising:', isAdvertising);
      return isAdvertising;
    } catch (error) {
      console.error('❌ Error checking advertising status:', error);
      return false;
    }
  }
}

export default BLEPeripheralExample;
