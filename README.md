# React Native BLE Peripheral

A simulator for a BLE peripheral, to help with testing BLE apps without an actual peripheral BLE device.

## Features

- ✅ Android support
- ✅ iOS support (React Native 0.60+)
- ✅ Create BLE services and characteristics
- ✅ Start/stop advertising
- ✅ Send notifications to connected devices
- ✅ Handle read/write requests
- ✅ Manufacturer Data support (Android only)

## Requirements

- React Native 0.60+
- iOS 11.0+
- Android API 21+


## Installation

### React Native 0.60+

```bash
npm install react-native-ble-peripheral
# or
yarn add react-native-ble-peripheral
```

For iOS, run:
```bash
cd ios && pod install
```

### React Native < 0.60

```bash
npm install react-native-ble-peripheral
react-native link react-native-ble-peripheral
```

npm page - https://www.npmjs.com/package/react-native-ble-peripheral
## Add permissions
* In `AndroidManifest.xml` add:
```xml

 <uses-permission android:name="android.permission.BLUETOOTH"/>
 <uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
```
## Project setup and initialization auto
```bash
react-native link
```
## Project setup and initialization manually 

* In `android/settings.gradle`

```gradle
...
include ':react-native-ble-peripheral'
project(':react-native-ble-peripheral').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-ble-peripheral/android')

```

* In `android/app/build.gradle`

```gradle
...
dependencies {
    /* YOUR DEPENDENCIES HERE */
   compile project(':react-native-ble-peripheral') // <--- add this
}

```

* Register Module (in MainApplication.java)

```java
import com.himelbrand.forwardcalls.RNForwardCallsPackage;  // <--- import

public class MainActivity extends ReactActivity {
  ......

  @Override
  protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new RNBLEPackage() // <--- Add this
      );
  }

  ......

}
```


## Usage

#### Import

```javascript
import BLEPeripheral from 'react-native-ble-peripheral';
```

#### Basic Example

```javascript
// Set device name
BLEPeripheral.setName('My BLE Device');

// Add a service
BLEPeripheral.addService('12345678-1234-1234-1234-123456789ABC', true);

// Add a characteristic to the service
BLEPeripheral.addCharacteristicToService(
  '12345678-1234-1234-1234-123456789ABC', // service UUID
  '87654321-4321-4321-4321-CBA987654321', // characteristic UUID
  2, // permissions (read)
  2, // properties (read)
  'Hello World' // initial data
);

// Start advertising
BLEPeripheral.start().then(() => {
  console.log('Started advertising');
});

// Stop advertising
BLEPeripheral.stop();

// Send notification
BLEPeripheral.sendNotificationToDevices(
  '12345678-1234-1234-1234-123456789ABC', // service UUID
  '87654321-4321-4321-4321-CBA987654321', // characteristic UUID
  'New data' // data to send
);
```

#### Add Service 
BLEPeripheral.addService(UUID:string, primary:boolean)
```javascript
BLEPeripheral.addService('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', true) //for primary service
BLEPeripheral.addService('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', false) //for non primary service
```
#### Add Characteristic
BLEPeripheral.addCharacteristicToService(ServiceUUID:string, UUID:string, permissions:number, properties:number)

https://developer.android.com/reference/android/bluetooth/BluetoothGattCharacteristic.html
the link above is for permissions and properties constants info

Permissions:
* 1 - Readable
* 2 - Readable Encrypted
* 4 - Readable Encrypted MITM (Man-in-the-middle) Protection 
* 16 - Writable
* 32 - Writable Encrypted
* 64 - Writable Encrypted MITM Protection
* 128 - Writable Signed
* 256 - Writable Signed MITM

Properties:
* 1 - Broadcastable
* 2 - Readable
* 4 - Writable without response
* 8 - Writable
* 16 - Supports notification
* 32 - Supports indication
* 64 - Signed Write
* 128 - Extended properties

```javascript
BLEPeripheral.addCharacteristicToService('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', 16 | 1, 8) //this is a Characteristic with read and write permissions and notify property
```
#### Notify to devices
BLEPeripheral.sendNotificationToDevices(ServiceUUID:string, CharacteristicUUID:string, data:byte[]) 
- note #1: in js it's not really a byte array, but an array of numbers
- note #2: the CharacteristicUUID must be of a Characteristic with notify property
```javascript
BLEPeripheral.sendNotificationToDevices('XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', [0x10,0x01,0xA1,0x80]) //sends a notification to all connected devices that, using the char uuid given
```

#### start Advertising 
note:use this only after adding services and characteristics
```javascript
 BLEPeripheral.start()
  .then(res => {
       console.log(res)
  }).catch(error => {
       console.log(error)
  })
```

In case of error, these are the error codes:
* 1 - Failed to start advertising as the advertise data to be broadcasted is larger than 31 bytes.
* 2 - Failed to start advertising because no advertising instance is available.
* 3 - Failed to start advertising as the advertising is already started.
* 4 - Operation failed due to an internal error.
* 5 - This feature is not supported on this platform.


#### stop Advertising 
```javascript
 BLEPeripheral.stop()
```

#### Set name (optional)
BLEPeripheral.setName(name:string)

This method sets the name of the device broadcast, before calling `start`.
```javascript
BLEPeripheral.setName('RNBLETEST')
```

#### Manufacturer Data (Android only)
BLEPeripheral.setManufacturerData(manufacturerId:number, data:number[])

This method sets the manufacturer data to be included in BLE advertisements. Must be called before `start()` to include manufacturer data in the initial advertisement.

**Parameters:**
- `manufacturerId`: Manufacturer ID (e.g., 0xFFFF for testing, 0x004C for Apple, etc.)
- `data`: Array of bytes (numbers 0-255) representing the manufacturer data

```javascript
// Set manufacturer data before starting advertising
const manufacturerId = 0xFFFF; // Test manufacturer ID
const manufacturerData = [0x01, 0x02, 0x03, 0x04, 0x05];
BLEPeripheral.setManufacturerData(manufacturerId, manufacturerData);

// Then start advertising (will include manufacturer data)
BLEPeripheral.start();
```

#### Update Manufacturer Data (Android only)
BLEPeripheral.updateManufacturerData(manufacturerId:number, data:number[])

This method updates the manufacturer data and automatically restarts advertising with the new data. Useful for updating manufacturer data while the device is already advertising.

```javascript
// Update manufacturer data while advertising
const newManufacturerData = [0xAA, 0xBB, 0xCC, 0xDD];
BLEPeripheral.updateManufacturerData(0xFFFF, newManufacturerData)
  .then(result => {
    console.log('Manufacturer data updated:', result);
  })
  .catch(error => {
    console.error('Failed to update manufacturer data:', error);
  });
```

**Note:** Manufacturer data is only supported on Android. On iOS, these methods will have no effect.

**Example - Gateway with Manufacturer Data:**
```javascript
// Setup gateway with manufacturer data
BLEPeripheral.setName('My BLE Gateway');
BLEPeripheral.setManufacturerData(0xFFFF, [0x01, 0x02, 0x03]);
BLEPeripheral.addService('12345678-1234-1234-1234-123456789ABC', true);
BLEPeripheral.start();

// Later, update manufacturer data with gateway information
const gatewayId = 1234;
const status = 1; // active
const gatewayData = [
  (gatewayId >> 8) & 0xFF,  // High byte
  gatewayId & 0xFF,          // Low byte
  status
];
BLEPeripheral.updateManufacturerData(0xFFFF, gatewayData);
```

**Important Notes about Manufacturer Data Size:**
- BLE advertising has a **31 byte limit** for the total advertising data
- Manufacturer data structure uses: 4 bytes overhead (type + length + company ID) + your data bytes
- For manufacturer data larger than 15 bytes, the device name will be **automatically excluded** from the advertising packet to ensure the manufacturer data fits
- The device name is still set via `setName()` and remains available via GATT connection
- Service UUIDs also consume space in the advertising packet

**Example - Large Manufacturer Data (21 bytes):**
```javascript
// Format: <0D6C> AB AA BBCC DDEE FF 77 7A17 6900 0000 00 00 00
// - 0D6C: Company ID (2 bytes)
// - AB: Packet ID (1 byte)
// - AA BBCC DDEE FF: Device name (6 bytes)
// - 77 7A17 6900 0000 00: Timestamp Unix UTC Seconds (10 bytes)
// - 00: Alert (1 byte)
// - 00: Temperature Profile (1 byte)

const companyId = 0x0D6C;
const packetId = 0xAB;
const deviceNameBytes = [0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF];

// Helper function to convert timestamp to 10 bytes (little-endian)
function timestampToBytes(timestamp) {
  const bytes = [];
  let value = timestamp;
  for (let i = 0; i < 10; i++) {
    bytes.push(value & 0xFF);
    value = Math.floor(value / 256);
  }
  return bytes;
}

const timestamp = Math.floor(Date.now() / 1000);
const timestampBytes = timestampToBytes(timestamp);

const manufacturerData = [
  packetId,
  ...deviceNameBytes,    // 6 bytes
  ...timestampBytes,     // 10 bytes
  0x00,                  // Alert
  0x00                   // Temperature Profile
]; // Total: 21 bytes

BLEPeripheral.setManufacturerData(companyId, manufacturerData);
BLEPeripheral.addService('12345678-1234-1234-1234-123456789ABC', true);
BLEPeripheral.start();

// Update timestamp every 30 seconds
setInterval(() => {
  const newTimestamp = Math.floor(Date.now() / 1000);
  const newTimestampBytes = timestampToBytes(newTimestamp);
  const updatedManufacturerData = [
    packetId,
    ...deviceNameBytes,
    ...newTimestampBytes,
    0x00,  // Alert
    0x00   // Temperature Profile
  ];
  BLEPeripheral.updateManufacturerData(companyId, updatedManufacturerData);
}, 30000);
```

DOCs and project is under development 
Any help would be welcome...
feel free to contact me
