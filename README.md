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

DOCs and project is under development 
Any help would be welcome...
feel free to contact me
