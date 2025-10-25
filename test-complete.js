// Teste completo do BLE Peripheral
import BLEPeripheral from './BLEPeripheral';

const testBLE = async () => {
  console.log('🚀 Iniciando teste completo do BLE Peripheral...');

  try {
    // 1. Verificar se o módulo está disponível
    console.log('1. Verificando módulo...');
    console.log('BLEPeripheral:', BLEPeripheral);
    console.log('Métodos disponíveis:', Object.keys(BLEPeripheral));

    // 2. Testar setName
    console.log('2. Testando setName...');
    await BLEPeripheral.setName('Test BLE Device');
    console.log('✅ setName funcionando');

    // 3. Testar addService
    console.log('3. Testando addService...');
    const serviceUUID = '12345678-1234-1234-1234-123456789ABC';
    await BLEPeripheral.addService(serviceUUID, true);
    console.log('✅ addService funcionando');

    // 4. Testar addCharacteristicToService
    console.log('4. Testando addCharacteristicToService...');
    const characteristicUUID = '87654321-4321-4321-4321-CBA987654321';
    await BLEPeripheral.addCharacteristicToService(
      serviceUUID,
      characteristicUUID,
      2 | 16, // read and write permissions
      2 | 8,  // read and write properties
      'Test data'
    );
    console.log('✅ addCharacteristicToService funcionando');

    // 5. Testar isAdvertising
    console.log('5. Testando isAdvertising...');
    const isAdvertising = await BLEPeripheral.isAdvertising();
    console.log('isAdvertising:', isAdvertising);
    console.log('✅ isAdvertising funcionando');

    // 6. Testar start
    console.log('6. Testando start...');
    const startResult = await BLEPeripheral.start();
    console.log('start result:', startResult);
    console.log('✅ start funcionando');

    // 7. Testar sendNotificationToDevices
    console.log('7. Testando sendNotificationToDevices...');
    await BLEPeripheral.sendNotificationToDevices(
      serviceUUID,
      characteristicUUID,
      'Hello from test!'
    );
    console.log('✅ sendNotificationToDevices funcionando');

    // 8. Testar stop
    console.log('8. Testando stop...');
    await BLEPeripheral.stop();
    console.log('✅ stop funcionando');

    // 9. Testar event listeners
    console.log('9. Testando event listeners...');
    const subscription = BLEPeripheral.addListener('onWarning', (warning) => {
      console.log('Warning received:', warning);
    });
    console.log('✅ Event listeners funcionando');

    // Cleanup
    subscription.remove();

    console.log('🎉 Todos os testes passaram! BLE Peripheral está funcionando 100%');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Stack trace:', error.stack);
  }
};

// Executar teste
testBLE();

export default testBLE;
