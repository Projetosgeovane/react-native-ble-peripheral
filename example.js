import BLEPeripheral from 'react-native-ble-peripheral';

// Example usage of the BLE Peripheral library

class BLEPeripheralExample {
  constructor() {
    this.serviceUUID = '12345678-1234-1234-1234-123456789ABC';
    this.characteristicUUID = '87654321-4321-4321-4321-CBA987654321';
  }

  async setupBLE() {
    try {
      // Set device name
      BLEPeripheral.setName('My BLE Device');

      // Add a primary service
      BLEPeripheral.addService(this.serviceUUID, true);

      // Add a characteristic with read and write permissions
      BLEPeripheral.addCharacteristicToService(
        this.serviceUUID,
        this.characteristicUUID,
        2 | 16, // read and write permissions
        2 | 8,  // read and write properties
        'Initial data'
      );

      // Start advertising
      const result = await BLEPeripheral.start();
      console.log('BLE advertising started:', result);

      // Listen for events
      BLEPeripheral.addListener('onWarning', (warning) => {
        console.log('BLE Warning:', warning);
      });

    } catch (error) {
      console.error('Error setting up BLE:', error);
    }
  }

  async sendData(data) {
    try {
      await BLEPeripheral.sendNotificationToDevices(
        this.serviceUUID,
        this.characteristicUUID,
        data
      );
      console.log('Data sent:', data);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  }

  async stopBLE() {
    try {
      await BLEPeripheral.stop();
      console.log('BLE advertising stopped');
    } catch (error) {
      console.error('Error stopping BLE:', error);
    }
  }

  async checkAdvertisingStatus() {
    try {
      const isAdvertising = await BLEPeripheral.isAdvertising();
      console.log('Is advertising:', isAdvertising);
      return isAdvertising;
    } catch (error) {
      console.error('Error checking advertising status:', error);
      return false;
    }
  }
}

export default BLEPeripheralExample;
