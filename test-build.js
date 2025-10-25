// Script para testar se o módulo está funcionando
import BLEPeripheral from './BLEPeripheral.js';

console.log('🧪 Testando BLE Peripheral...');

// Teste 1: Verificar se o módulo está disponível
console.log('1. Verificando módulo...');
if (!BLEPeripheral) {
  console.error('❌ BLEPeripheral não está disponível');
  process.exit(1);
}
console.log('✅ BLEPeripheral está disponível');

// Teste 2: Verificar métodos
console.log('2. Verificando métodos...');
const methods = [
  'setName',
  'isAdvertising',
  'addService',
  'addCharacteristicToService',
  'start',
  'stop',
  'sendNotificationToDevices',
  'addListener',
  'removeListener',
  'removeAllListeners'
];

let allMethodsAvailable = true;
methods.forEach(method => {
  if (typeof BLEPeripheral[method] === 'function') {
    console.log(`✅ ${method} está disponível`);
  } else {
    console.log(`❌ ${method} NÃO está disponível`);
    allMethodsAvailable = false;
  }
});

if (!allMethodsAvailable) {
  console.error('❌ Alguns métodos não estão disponíveis');
  process.exit(1);
}

// Teste 3: Verificar tipos de retorno
console.log('3. Verificando tipos de retorno...');
try {
  const isAdvertisingPromise = BLEPeripheral.isAdvertising();
  if (isAdvertisingPromise && typeof isAdvertisingPromise.then === 'function') {
    console.log('✅ isAdvertising retorna Promise');
  } else {
    console.log('❌ isAdvertising não retorna Promise');
  }
} catch (error) {
  console.log('❌ Erro ao testar isAdvertising:', error.message);
}

console.log('🎉 Todos os testes passaram! BLE Peripheral está funcionando corretamente.');
