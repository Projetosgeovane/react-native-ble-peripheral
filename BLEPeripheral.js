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

  updateServiceUUID(newUUID) {
    if (typeof newUUID !== 'string') {
      return Promise.reject(new Error('UUID must be a string'));
    }
    return this.module.updateServiceUUID(newUUID);
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