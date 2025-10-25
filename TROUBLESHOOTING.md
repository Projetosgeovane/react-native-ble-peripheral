# Troubleshooting - React Native BLE Peripheral

## Problema: "is not a function" errors

### Possíveis Causas e Soluções:

#### 1. **Módulo não está sendo linkado corretamente**

**Sintomas:**
- `BLEPeripheral.setName is not a function`
- `BLEPeripheral is undefined`

**Soluções:**

**Para React Native 0.60+:**
```bash
# Limpe o cache
npx react-native start --reset-cache

# Para iOS
cd ios && pod install && cd ..

# Para Android
cd android && ./gradlew clean && cd ..
```

**Para React Native < 0.60:**
```bash
react-native unlink react-native-ble-peripheral
react-native link react-native-ble-peripheral
```

#### 2. **Problemas de build do iOS**

**Sintomas:**
- Erro de compilação no Xcode
- Módulo não encontrado

**Soluções:**

1. **Limpe o build do Xcode:**
   - Abra o projeto no Xcode
   - Product → Clean Build Folder (Cmd+Shift+K)
   - Build novamente

2. **Verifique se o podspec está correto:**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

3. **Verifique se o módulo está no Podfile:**
   ```ruby
   pod 'react-native-ble-peripheral', :path => '../node_modules/react-native-ble-peripheral'
   ```

#### 3. **Problemas de permissões**

**Para iOS, adicione no Info.plist:**
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to communicate with BLE devices</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app uses Bluetooth to advertise as a BLE peripheral</string>
```

**Para Android, adicione no AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

#### 4. **Verificação de Debug**

Adicione este código para verificar se o módulo está disponível:

```javascript
import BLEPeripheral from 'react-native-ble-peripheral';

console.log('BLEPeripheral module:', BLEPeripheral);
console.log('Available methods:', Object.keys(BLEPeripheral));

// Verificar métodos específicos
const methods = ['setName', 'isAdvertising', 'addService', 'start', 'stop'];
methods.forEach(method => {
  if (typeof BLEPeripheral[method] === 'function') {
    console.log(`✅ ${method} is available`);
  } else {
    console.log(`❌ ${method} is NOT available`);
  }
});
```

#### 5. **Problemas de Metro Bundler**

```bash
# Limpe o cache do Metro
npx react-native start --reset-cache

# Ou delete os caches manualmente
rm -rf node_modules
npm install
# ou
yarn install
```

#### 6. **Verificação do Auto-linking**

Para React Native 0.60+, verifique se o arquivo `react-native.config.js` existe:

```javascript
module.exports = {
  dependencies: {
    'react-native-ble-peripheral': {
      platforms: {
        ios: {
          project: 'ios/RNBLEPeripheral.xcodeproj',
        },
      },
    },
  },
};
```

### Teste Básico

```javascript
import BLEPeripheral from 'react-native-ble-peripheral';

// Teste básico
try {
  console.log('Testing BLEPeripheral...');
  BLEPeripheral.setName('Test Device');
  console.log('✅ BLEPeripheral is working!');
} catch (error) {
  console.error('❌ BLEPeripheral error:', error);
}
```

### Contato

Se os problemas persistirem, verifique:
1. Versão do React Native
2. Versão do iOS/Android
3. Logs do Metro Bundler
4. Logs do Xcode/Android Studio
