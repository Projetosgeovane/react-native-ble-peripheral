/**
 * @providesModule BLEPeripheral
 */

'use strict';

import { NativeModules, NativeEventEmitter } from 'react-native';

const { BLEPeripheral } = NativeModules;

class BLEPeripheralManager extends NativeEventEmitter {
  constructor() {
    super(BLEPeripheral);
  }

  setName(name) {
    return BLEPeripheral.setName(name);
  }

  isAdvertising() {
    return BLEPeripheral.isAdvertising();
  }

  addService(uuid, primary) {
    return BLEPeripheral.addService(uuid, primary);
  }

  addCharacteristicToService(serviceUUID, uuid, permissions, properties, data) {
    return BLEPeripheral.addCharacteristicToService(serviceUUID, uuid, permissions, properties, data);
  }

  start() {
    return BLEPeripheral.start();
  }

  stop() {
    return BLEPeripheral.stop();
  }

  sendNotificationToDevices(serviceUUID, characteristicUUID, data) {
    return BLEPeripheral.sendNotificationToDevices(serviceUUID, characteristicUUID, data);
  }
}

export default new BLEPeripheralManager();