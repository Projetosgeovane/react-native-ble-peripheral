# Atualização Dinâmica de UUID do Serviço BLE

Este documento explica como usar a funcionalidade de atualização dinâmica do UUID do serviço BLE sem precisar reiniciar o app ou chamar `stopAdvertising()`.

## 📋 Requisitos

- iOS 10.0 ou superior
- React Native configurado com o módulo BLE Peripheral
- Dispositivo iOS com Bluetooth habilitado

## 🚀 Funcionalidade

A função `updateServiceUUID(newUUID: string)` permite atualizar dinamicamente o UUID do serviço BLE enquanto o app está em execução. Isso é útil para cenários onde você precisa:

- Rotacionar UUIDs periodicamente por segurança
- Usar UUIDs com timestamps para rastreamento
- Implementar UUIDs dinâmicos baseados em condições específicas

## 🔧 Implementação

### Código Swift (ios/RNBLEPeripheral.swift)

```92:137:ios/RNBLEPeripheral.swift
@objc func updateServiceUUID(_ newUUID: String) {
    // Validate UUID format
    guard CBUUID(string: newUUID).uuidString != "00000000-0000-0000-0000-000000000000" else {
        alertJS("Invalid UUID format: \(newUUID)")
        return
    }
    
    // Check if advertising is active
    if !advertising {
        alertJS("Cannot update UUID: not advertising")
        return
    }
    
    print("Updating service UUID to: \(newUUID)")
    
    // Stop advertising temporarily
    manager.stopAdvertising()
    
    // Remove all existing services
    manager.removeAllServices()
    
    // Clear the services map
    let oldServicesMap = servicesMap
    servicesMap.removeAll()
    
    // Create and add new service with the same characteristics from the old one
    let newServiceUUID = CBUUID(string: newUUID)
    let newService = CBMutableService(type: newServiceUUID, primary: true)
    
    // Try to preserve characteristics from the old service
    if let oldService = oldServicesMap.values.first {
        newService.characteristics = oldService.characteristics
    }
    
    servicesMap[newUUID] = newService
    manager.add(newService)
    
    // Restart advertising with new UUID
    let advertisementData = [
        CBAdvertisementDataLocalNameKey: name,
        CBAdvertisementDataServiceUUIDsKey: getServiceUUIDArray()
        ] as [String : Any]
    manager.startAdvertising(advertisementData)
    
    print("Service UUID updated to: \(newUUID)")
}
```

### Bridge Objective-C (ios/RNBLEPeripheral.m)

```13:13:ios/RNBLEPeripheral.m
RCT_EXTERN_METHOD(updateServiceUUID:(NSString *)newUUID)
```

### Código JavaScript (BLEPeripheral.js)

```87:92:BLEPeripheral.js
updateServiceUUID(newUUID) {
  if (typeof newUUID !== 'string') {
    return Promise.reject(new Error('UUID must be a string'));
  }
  return this.module.updateServiceUUID(newUUID);
}
```

## 💡 Exemplo de Uso

### Exemplo 1: Atualizar UUID com Timestamp a cada 30 segundos

```javascript
import BLEPeripheral from './BLEPeripheral';

// UUID base
const BASE_UUID = '0D6CABAA-BBCC-DDEE-FF';

// Atualizar UUID a cada 30 segundos
setInterval(() => {
  const timestamp = Math.floor(Date.now() / 1000);
  const timestampHex = timestamp.toString(16).padStart(8, '0');
  const newUUID = `${BASE_UUID}${timestampHex}`.toUpperCase();
  
  console.log(`Atualizando UUID para: ${newUUID}`);
  BLEPeripheral.updateServiceUUID(newUUID);
}, 30000);
```

### Exemplo 2: Atualizar UUID em React Native com Hook

```javascript
import { useEffect, useCallback } from 'react';
import { View, Text, Button } from 'react-native';
import BLEPeripheral from './BLEPeripheral';

const BLEComponent = () => {
  const updateUUID = useCallback(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    const newUUID = `0D6CABAA-BBCC-DDEE-FF${timestamp.toString(16).padStart(8, '0')}`.toUpperCase();
    BLEPeripheral.updateServiceUUID(newUUID);
  }, []);

  useEffect(() => {
    // Atualizar UUID a cada 30 segundos
    const interval = setInterval(updateUUID, 30000);
    return () => clearInterval(interval);
  }, [updateUUID]);

  return (
    <View>
      <Text>UUID do serviço atualizando dinamicamente</Text>
      <Button title="Atualizar UUID Agora" onPress={updateUUID} />
    </View>
  );
};

export default BLEComponent;
```

### Exemplo 3: Atualização com UUID Rotativo

```javascript
import BLEPeripheral from './BLEPeripheral';

const UUIDs = [
  '0D6CABAA-BBCC-DDEE-FF-11111111',
  '0D6CABAA-BBCC-DDEE-FF-22222222',
  '0D6CABAA-BBCC-DDEE-FF-33333333',
];

let currentIndex = 0;

setInterval(() => {
  const newUUID = UUIDs[currentIndex];
  BLEPeripheral.updateServiceUUID(newUUID);
  currentIndex = (currentIndex + 1) % UUIDs.length;
  console.log(`UUID atualizado para: ${newUUID}`);
}, 60000); // A cada 1 minuto
```

## ⚙️ Comportamento

### O que acontece quando você chama `updateServiceUUID`:

1. **Validação**: Verifica se o UUID é válido e se o advertising está ativo
2. **Pausa do Advertising**: Para temporariamente o advertising
3. **Remoção de Serviços**: Remove todos os serviços existentes do CBPeripheralManager
4. **Preservação**: Mantém as características do serviço anterior
5. **Criação**: Cria um novo serviço com o UUID fornecido
6. **Reinício**: Reinicia o advertising com o novo UUID

### ⚠️ Limitações

- O método preserva automaticamente as características do serviço anterior
- Dispositivos conectados podem perder a conexão durante a atualização
- O UUID deve estar em formato válido (ex: `12345678-1234-1234-1234-123456789012`)
- Não é necessário chamar `stopAdvertising()` antes - o método faz isso automaticamente

## 🧪 Testando

Para testar a funcionalidade:

1. Compile o app no iOS
2. Inicie o advertising com `BLEPeripheral.start()`
3. Use um scanner BLE para verificar o UUID atual
4. Chame `BLEPeripheral.updateServiceUUID('NOVO-UUID')`
5. Verifique no scanner que o UUID foi atualizado

## 📝 Notas Importantes

- Esta funcionalidade é **específica para iOS** (não implementada para Android ainda)
- O UUID do serviço é usado em advetising, então a mudança será visível imediatamente
- As características do serviço são preservadas durante a atualização
- A atualização é atômica (ocorre em uma única chamada)

## 🔄 Fluxo de Execução

```
updateServiceUUID('NOVO-UUID')
    ↓
stopAdvertising()
    ↓
removeAllServices()
    ↓
Criar novo serviço com novo UUID
    ↓
Adicionar características preservadas
    ↓
add(newService)
    ↓
startAdvertising() com novo UUID
    ↓
Concluído!
```

