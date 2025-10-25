# Instalação Passo a Passo - React Native BLE Peripheral

## ✅ Pré-requisitos

- React Native 0.60+
- iOS 11.0+
- Xcode 11.0+
- Node.js 12+

## 📱 Instalação iOS

### 1. Instalar o pacote
```bash
npm install react-native-ble-peripheral
# ou
yarn add react-native-ble-peripheral
```

### 2. Instalar dependências iOS
```bash
cd ios
pod install
cd ..
```

### 3. Adicionar permissões no Info.plist
Abra `ios/YourApp/Info.plist` e adicione:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to communicate with BLE devices</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app uses Bluetooth to advertise as a BLE peripheral</string>
```

### 4. Limpar e rebuildar
```bash
# Limpar cache
npx react-native start --reset-cache

# Limpar build iOS
cd ios
xcodebuild clean
cd ..

# Rebuildar
npx react-native run-ios
```

## 🤖 Instalação Android

### 1. Adicionar permissões no AndroidManifest.xml
Abra `android/app/src/main/AndroidManifest.xml` e adicione:

```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

### 2. Rebuildar Android
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 🧪 Teste de Instalação

Crie um arquivo de teste:

```javascript
// test-ble.js
import BLEPeripheral from 'react-native-ble-peripheral';

const testBLE = async () => {
  try {
    console.log('Testando BLE Peripheral...');
    
    // Teste básico
    await BLEPeripheral.setName('Test Device');
    console.log('✅ BLE Peripheral funcionando!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

testBLE();
```

## 🔧 Solução de Problemas

### Erro: "BLEPeripheral is not a function"
```bash
# Limpar tudo
rm -rf node_modules
npm install
cd ios && pod install && cd ..
npx react-native start --reset-cache
```

### Erro: "Module not found"
```bash
# Verificar se o auto-linking está funcionando
npx react-native config
```

### Erro de compilação iOS
```bash
# Limpar build do Xcode
cd ios
xcodebuild clean
pod deintegrate
pod install
cd ..
```

### Erro de permissões
- Verifique se as permissões estão no Info.plist
- Verifique se o Bluetooth está habilitado no dispositivo
- Verifique se o app tem permissão para usar Bluetooth

## 📋 Checklist de Instalação

- [ ] Pacote instalado via npm/yarn
- [ ] `pod install` executado no iOS
- [ ] Permissões adicionadas no Info.plist
- [ ] Permissões adicionadas no AndroidManifest.xml
- [ ] Cache limpo
- [ ] App rebuildado
- [ ] Teste básico executado com sucesso

## 🚀 Uso Básico

```javascript
import BLEPeripheral from 'react-native-ble-peripheral';

// Configurar dispositivo
await BLEPeripheral.setName('Meu Dispositivo');

// Adicionar serviço
await BLEPeripheral.addService('12345678-1234-1234-1234-123456789ABC', true);

// Adicionar característica
await BLEPeripheral.addCharacteristicToService(
  '12345678-1234-1234-1234-123456789ABC',
  '87654321-4321-4321-4321-CBA987654321',
  2 | 16, // permissões
  2 | 8,  // propriedades
  'Dados iniciais'
);

// Iniciar advertising
await BLEPeripheral.start();

// Parar advertising
await BLEPeripheral.stop();
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Metro Bundler
2. Verifique os logs do Xcode/Android Studio
3. Execute o teste básico
4. Verifique se todas as permissões estão corretas
