// Test file to verify module functionality
import BLEPeripheral from './BLEPeripheral';

console.log('BLEPeripheral module:', BLEPeripheral);
console.log('Available methods:', Object.keys(BLEPeripheral));

// Test if methods exist
const methods = [
  'setName',
  'isAdvertising', 
  'addService',
  'addCharacteristicToService',
  'start',
  'stop',
  'sendNotificationToDevices'
];

methods.forEach(method => {
  if (typeof BLEPeripheral[method] === 'function') {
    console.log(`✅ ${method} is available`);
  } else {
    console.log(`❌ ${method} is NOT available`);
  }
});

export default BLEPeripheral;
