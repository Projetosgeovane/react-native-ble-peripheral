/**
 * Exemplo de uso do updateServiceUUID
 * 
 * Este exemplo mostra como atualizar dinamicamente o UUID do serviço BLE
 * a cada 30 segundos, incluindo um timestamp no final do UUID.
 */

import BLEPeripheral from './BLEPeripheral';

// UUID base
const BASE_UUID = '0D6CABAA-BBCC-DDEE-FF';

// Função para atualizar o UUID com timestamp
const updateServiceUUIDWithTimestamp = () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const timestampHex = timestamp.toString(16).padStart(8, '0').toUpperCase();
  const newUUID = `${BASE_UUID}${timestampHex}`;

  console.log(`Atualizando UUID para: ${newUUID}`);
  BLEPeripheral.updateServiceUUID(newUUID);
};

// Inicializar o BLE Peripheral
const initBLEPeripheral = async () => {
  try {
    // Configurar o nome do dispositivo
    BLEPeripheral.setName('MyBLEDevice');

    // Adicionar um serviço inicial
    const initialUUID = `${BASE_UUID}00000000`;
    BLEPeripheral.addService(initialUUID, true);

    // Adicionar uma característica
    BLEPeripheral.addCharacteristicToService(
      initialUUID,
      '0000FF01-0000-1000-8000-00805F9B34FB', // Characteristic UUID
      2, // Permissions: CBAttributePermissionsReadable
      2, // Properties: CBCharacteristicPropertiesRead
      'Hello BLE!' // Data inicial
    );

    // Iniciar advertising
    console.log('Iniciando advertising...');
    await BLEPeripheral.start();
    console.log('Advertising iniciado!');

    // Atualizar UUID a cada 30 segundos
    setInterval(updateServiceUUIDWithTimestamp, 30000);

    // Primeira atualização após 5 segundos
    setTimeout(updateServiceUUIDWithTimestamp, 5000);

    // Exemplo: Enviar notificação aos dispositivos
    setInterval(() => {
      BLEPeripheral.sendNotificationToDevices(
        BLEPeripheral.servicesMap.keys()[0], // Pega o primeiro UUID
        '0000FF01-0000-1000-8000-00805F9B34FB',
        `Data: ${new Date().toISOString()}`
      ).catch(err => console.error('Erro ao enviar notificação:', err));
    }, 10000);

    // Listener de eventos
    BLEPeripheral.addListener('onWarning', (message) => {
      console.log('BLE Warning:', message);
    });

  } catch (error) {
    console.error('Erro ao inicializar BLE:', error);
  }
};

// Executar a inicialização
initBLEPeripheral();

export default updateServiceUUIDWithTimestamp;

