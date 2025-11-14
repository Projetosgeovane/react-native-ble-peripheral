/**
 * @providesModule BLEPeripheral
 */

'use strict';

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { BLEPeripheral } = NativeModules;

// Check if module is available
if (!BLEPeripheral) {
  throw new Error('BLEPeripheral native module is not available. Make sure you have properly linked the library.');
}

// Create event emitter
const eventEmitter = new NativeEventEmitter(BLEPeripheral);

// Wrapper class with proper error handling
class BLEPeripheralManager {
  constructor() {
    this.module = BLEPeripheral;
  }

  // Event emitter methods
  addListener(eventName, listener) {
    return eventEmitter.addListener(eventName, listener);
  }

  removeListener(eventName, listener) {
    return eventEmitter.removeListener(eventName, listener);
  }

  removeAllListeners(eventName) {
    return eventEmitter.removeAllListeners(eventName);
  }

  // BLE Methods with error handling
  setName(name) {
    if (typeof name !== 'string') {
      return Promise.reject(new Error('Name must be a string'));
    }
    return this.module.setName(name);
  }

  setManufacturerData(manufacturerId, data) {
    if (Platform.OS !== 'android') {
      return Promise.reject(new Error('Manufacturer data is only supported on Android'));
    }
    if (typeof manufacturerId !== 'number') {
      return Promise.reject(new Error('Manufacturer ID must be a number'));
    }
    if (!Array.isArray(data)) {
      return Promise.reject(new Error('Manufacturer data must be an array'));
    }
    // Convert array to ReadableArray format (array of numbers 0-255)
    const dataArray = data.map(byte => {
      const num = typeof byte === 'number' ? byte : parseInt(byte, 10);
      if (isNaN(num) || num < 0 || num > 255) {
        throw new Error('Manufacturer data bytes must be numbers between 0 and 255');
      }
      return num;
    });
    return this.module.setManufacturerData(manufacturerId, dataArray);
  }

  updateManufacturerData(manufacturerId, data) {
    if (Platform.OS !== 'android') {
      return Promise.reject(new Error('Manufacturer data is only supported on Android'));
    }
    if (typeof manufacturerId !== 'number') {
      return Promise.reject(new Error('Manufacturer ID must be a number'));
    }
    if (!Array.isArray(data)) {
      return Promise.reject(new Error('Manufacturer data must be an array'));
    }
    // Convert array to ReadableArray format (array of numbers 0-255)
    const dataArray = data.map(byte => {
      const num = typeof byte === 'number' ? byte : parseInt(byte, 10);
      if (isNaN(num) || num < 0 || num > 255) {
        throw new Error('Manufacturer data bytes must be numbers between 0 and 255');
      }
      return num;
    });
    return this.module.updateManufacturerData(manufacturerId, dataArray);
  }

  isAdvertising() {
    return this.module.isAdvertising();
  }

  addService(uuid, primary) {
    if (typeof uuid !== 'string') {
      return Promise.reject(new Error('UUID must be a string'));
    }
    if (typeof primary !== 'boolean') {
      return Promise.reject(new Error('Primary must be a boolean'));
    }
    return this.module.addService(uuid, primary);
  }

  addCharacteristicToService(serviceUUID, uuid, permissions, properties, data) {
    if (typeof serviceUUID !== 'string') {
      return Promise.reject(new Error('Service UUID must be a string'));
    }
    if (typeof uuid !== 'string') {
      return Promise.reject(new Error('Characteristic UUID must be a string'));
    }
    if (typeof permissions !== 'number') {
      return Promise.reject(new Error('Permissions must be a number'));
    }
    if (typeof properties !== 'number') {
      return Promise.reject(new Error('Properties must be a number'));
    }
    if (typeof data !== 'string') {
      return Promise.reject(new Error('Data must be a string'));
    }
    return this.module.addCharacteristicToService(serviceUUID, uuid, permissions, properties, data);
  }

  start() {
    return this.module.start();
  }

  stop() {
    return this.module.stop();
  }

  // NEW: stop advertising without removing services
  stopAdvertisingOnly() {
    return this.module.stopAdvertisingOnly();
  }

  updateServiceUUID(newUUID) {
    if (typeof newUUID !== 'string') {
      return Promise.reject(new Error('UUID must be a string'));
    }
    return this.module.updateServiceUUID(newUUID);
  }

  updateServiceUUIDSeamless(newUUID) {
    if (typeof newUUID !== 'string') {
      return Promise.reject(new Error('UUID must be a string'));
    }
    return this.module.updateServiceUUIDSeamless(newUUID);
  }

  // NEW: remove a single service by UUID
  removeService(uuid) {
    if (typeof uuid !== 'string') {
      return Promise.reject(new Error('UUID must be a string'));
    }
    return this.module.removeService(uuid);
  }

  // NEW: remove all services
  removeAllServices() {
    return this.module.removeAllServices();
  }

  // NEW: get current service UUIDs as array of strings
  getServiceUUIDs() {
    return this.module.getServiceUUIDs();
  }

  // NEW: get current services metadata
  getCurrentServices() {
    return this.module.getCurrentServices();
  }

  sendNotificationToDevices(serviceUUID, characteristicUUID, data) {
    if (typeof serviceUUID !== 'string') {
      return Promise.reject(new Error('Service UUID must be a string'));
    }
    if (typeof characteristicUUID !== 'string') {
      return Promise.reject(new Error('Characteristic UUID must be a string'));
    }
    if (typeof data !== 'string') {
      return Promise.reject(new Error('Data must be a string'));
    }
    return this.module.sendNotificationToDevices(serviceUUID, characteristicUUID, data);
  }
}

export default new BLEPeripheralManager();