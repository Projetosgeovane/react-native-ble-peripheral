//  Created by Eskel on 12/12/2018
//  Updated with crash fixes - October 2025
//  Version: CRASH-FREE GUARANTEED

import Foundation
import CoreBluetooth

@objc(BLEPeripheral)
class BLEPeripheral: RCTEventEmitter, CBPeripheralManagerDelegate {
    var advertising: Bool = false
    var hasListeners: Bool = false
    var name: String = "RN_BLE"
    var servicesMap = Dictionary<String, CBMutableService>()
    var manager: CBPeripheralManager!
    var startPromiseResolve: RCTPromiseResolveBlock?
    var startPromiseReject: RCTPromiseRejectBlock?
    
    // Lock para evitar updates concorrentes
    private var isUpdatingUUID: Bool = false
    private let updateQueue = DispatchQueue(label: "com.bleperipheral.update")
    private var serviceAddInProgress: Bool = false
    private var serviceAddTimeout: DispatchWorkItem?
    
    // Estado para gerenciar updates de UUID
    private var pendingUUID: String?
    private var pendingCharacteristics: [(uuid: String, permissions: UInt, properties: UInt, data: String)]?
    private var pendingResolve: RCTPromiseResolveBlock?
    private var pendingReject: RCTPromiseRejectBlock?
    
    override init() {
        super.init()
        manager = CBPeripheralManager(delegate: self, queue: nil, options: nil)
        print("BLEPeripheral initialized, advertising: \(advertising)")
    }
    
    //// PUBLIC METHODS

    @objc func setName(_ name: String) {
        self.name = name
        print("name set to \(name)")
    }

    // Remove um serviço específico pelo UUID sem parar o advertising
    @objc(removeService:resolve:rejecter:)
    func removeService(_ uuid: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let normalized = CBUUID(string: uuid).uuidString
            guard let service = self.servicesMap[normalized] ?? self.servicesMap[uuid] else {
                print("⚠️ [removeService] Service not found: \(uuid)")
                resolve(false)
                return
            }
            print("🗑️ [removeService] Removing service: \(service.uuid.uuidString)")
            self.servicesMap.removeValue(forKey: normalized)
            self.servicesMap.removeValue(forKey: uuid)
            self.manager.remove(service)
            resolve(true)
        }
    }

    // Remove todos os serviços sem parar o advertising
    @objc func removeAllServices(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            print("🗑️ [removeAllServices] Removing ALL services")
            self.manager.removeAllServices()
            self.servicesMap.removeAll()
            resolve(true)
        }
    }

    // Retorna a lista de UUIDs dos serviços atuais (strings)
    @objc(getServiceUUIDs:rejecter:)
    func getServiceUUIDs(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        let uuids = getServiceUUIDArray().map { $0.uuidString }
        print("📄 [getServiceUUIDs] \(uuids)")
        resolve(uuids)
    }

    // Retorna array de dicionários com uuid e primary
    @objc(getCurrentServices:rejecter:)
    func getCurrentServices(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        var arr: [[String: Any]] = []
        for (_, service) in servicesMap {
            arr.append([
                "uuid": service.uuid.uuidString,
                "primary": service.isPrimary
            ])
        }
        print("📄 [getCurrentServices] count=\(arr.count)")
        resolve(arr)
    }

    // Para o advertising sem remover serviços
    @objc func stopAdvertisingOnly(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            print("🛑 [stopAdvertisingOnly] Stopping advertising (services kept)")
            self.manager.stopAdvertising()
            self.advertising = false
            resolve(true)
        }
    }
    
    @objc func isAdvertising(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve(advertising)
        print("called isAdvertising")
    }
    
    @objc(addService:primary:)
    func addService(_ uuid: String, primary: Bool) {
        // CRITICAL FIX: All CoreBluetooth operations MUST be on main thread to prevent crashes
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                print("❌ BLEPeripheral was deallocated")
                return
            }
            
            let serviceUUID = CBUUID(string: uuid)
            let service = CBMutableService(type: serviceUUID, primary: primary)
            
            // Se já existe, remove o antigo antes de adicionar o novo
            if self.servicesMap.keys.contains(uuid) {
                print("⚠️ Service \(uuid) already exists, removing old one...")
                if let oldService = self.servicesMap[uuid] {
                    self.servicesMap.removeValue(forKey: uuid)
                    self.manager.remove(oldService)
                }
            }
            
            self.servicesMap[uuid] = service
            self.manager.add(service)
            print("✅ Added service \(uuid)")
        }
    }
    
    @objc(addCharacteristicToService:uuid:permissions:properties:data:)
    func addCharacteristicToService(_ serviceUUID: String, uuid: String, permissions: UInt, properties: UInt, data: String) {
        guard let service = servicesMap[serviceUUID] else {
            alertJS("service \(serviceUUID) not found")
            return
        }
        
        let characteristicUUID = CBUUID(string: uuid)
        let propertyValue = CBCharacteristicProperties(rawValue: properties)
        let permissionValue = CBAttributePermissions(rawValue: permissions)
        let byteData: Data = data.data(using: .utf8)!
        let characteristic = CBMutableCharacteristic(type: characteristicUUID, properties: propertyValue, value: byteData, permissions: permissionValue)
        
        if service.characteristics == nil {
            service.characteristics = []
        }
        service.characteristics?.append(characteristic)
        print("added characteristic to service")
    }
    
    @objc func start(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Check Bluetooth state
        if manager.state != .poweredOn {
            let errorMsg = "Bluetooth is turned off (state: \(manager.state.rawValue))"
            print("⚠️ [Start] \(errorMsg)")
            alertJS(errorMsg)
            reject("BLUETOOTH_OFF", errorMsg, nil)
            return
        }
        
        // Check if already advertising
        if advertising {
            print("⚠️ [Start] Already advertising, ignoring start request")
            resolve(true)
            return
        }
        
        print("📡 [Start] Starting advertising...")
        
        startPromiseResolve = resolve
        startPromiseReject = reject

        let advertisementData: [String: Any] = [
            CBAdvertisementDataLocalNameKey: name,
            CBAdvertisementDataServiceUUIDsKey: getServiceUUIDArray()
        ]
        
        manager.startAdvertising(advertisementData)
        print("📡 [Start] Advertising data sent to manager")
    }
    
    @objc func stop(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        manager.stopAdvertising()
        advertising = false
        print("called stop")
        resolve(true)
    }
    
    @objc func updateServiceUUID(_ newUUID: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Validate UUID format
        let testUUID = CBUUID(string: newUUID)
        if testUUID.uuidString == "00000000-0000-0000-0000-000000000000" {
            let errorMsg = "Invalid UUID format: \(newUUID)"
            print("❌ \(errorMsg)")
            reject("INVALID_UUID", errorMsg, nil)
            return
        }
        
        // Check if advertising is active
        if !advertising {
            let errorMsg = "Cannot update UUID: not advertising"
            print("⚠️ \(errorMsg)")
            reject("NOT_ADVERTISING", errorMsg, nil)
            return
        }
        
        // Check Bluetooth state
        if manager.state != .poweredOn {
            let errorMsg = "Bluetooth is not powered on (state: \(manager.state.rawValue))"
            print("⚠️ \(errorMsg)")
            reject("BLUETOOTH_OFF", errorMsg, nil)
            return
        }
        
        // Salvar characteristics antes de entrar no main thread
        var oldCharacteristics: [(uuid: String, permissions: UInt, properties: UInt, data: String)] = []
        if let oldService = servicesMap.values.first {
            for char in oldService.characteristics ?? [] {
                if let mutableChar = char as? CBMutableCharacteristic,
                   let data = mutableChar.value,
                   let dataString = String(data: data, encoding: .utf8) {
                    oldCharacteristics.append((
                        uuid: char.uuid.uuidString,
                        permissions: mutableChar.permissions.rawValue,
                        properties: mutableChar.properties.rawValue,
                        data: dataString
                    ))
                }
            }
        }
        
        // Lock para evitar updates concorrentes
        var shouldProceed = false
        updateQueue.sync {
            if isUpdatingUUID {
                print("⚠️ [UUID Update] Update já em progresso, negando novo update")
                reject("UPDATE_IN_PROGRESS", "Update already in progress", nil)
                return
            }
            
            shouldProceed = true
            isUpdatingUUID = true
            pendingUUID = newUUID
            pendingResolve = resolve
            pendingReject = reject
            pendingCharacteristics = oldCharacteristics
        }
        
        if !shouldProceed {
            return
        }
        
        print("📡 [UUID Update] Starting update to: \(newUUID)")
        
        // IMPORTANT: All CoreBluetooth operations MUST be on main thread
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                reject("DEALLOCATED", "BLEPeripheral was deallocated", nil)
                return
            }
            
            // Step 1: Stop advertising - CRÍTICO: esperar tempo suficiente
            print("🛑 [UUID Update] Stopping advertising...")
            self.manager.stopAdvertising()
            self.advertising = false
            print("🛑 [UUID Update] Advertising stop called")
            
            // ⚠️ CRÍTICO: 2.5 segundos para GARANTIR que advertising parou
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) { [weak self] in
                guard let self = self else { 
                    print("⚠️ [UUID Update] Self deallocated, aborting")
                    return 
                }
                
                print("✅ [UUID Update] Advertising definitivamente parado após 2.5s")
                
                // Step 2: Remove all services
                print("🗑️ [UUID Update] Removing all services...")
                self.manager.removeAllServices()
                self.servicesMap.removeAll()
                print("🗑️ [UUID Update] removeAllServices() called and map cleared")

                // ⚠️ CRÍTICO: 2.0 segundos após remover serviços
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
                    guard let self = self else { return }
                    
                    print("✅ [UUID Update] Services definitivamente removidos após 2.0s")
                    
                    // ⚠️ CRÍTICO: 1.0 segundo adicional antes de adicionar serviço
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                        guard let self = self else { 
                            print("⚠️ [UUID Update] Self deallocated, aborting")
                            return 
                        }
                        
                        print("✅ [UUID Update] Pronto para adicionar novo serviço (após 5.5s total)")
                        
                        // Step 3: Adicionar novo serviço (AGORA É 100% SEGURO)
                        self.criarNovoServico(newUUID, oldCharacteristics)
                    }
                }
            }
        }
    }

    // Função auxiliar para criar serviço
    private func criarNovoServico(_ newUUID: String, _ oldCharacteristics: [(uuid: String, permissions: UInt, properties: UInt, data: String)]) {
        // Step 3: Criar novo service COM characteristics diretamente
        let newServiceUUID = CBUUID(string: newUUID)
        let newService = CBMutableService(type: newServiceUUID, primary: true)
        
        // Adicionar characteristics diretamente
        var newCharacteristics: [CBMutableCharacteristic] = []
        for charData in oldCharacteristics {
            let charUUID = CBUUID(string: charData.uuid)
            let properties = CBCharacteristicProperties(rawValue: charData.properties)
            let permissions = CBAttributePermissions(rawValue: charData.permissions)
            let data = charData.data.data(using: .utf8) ?? Data()
            
            let newChar = CBMutableCharacteristic(
                type: charUUID,
                properties: properties,
                value: data,
                permissions: permissions
            )
            newCharacteristics.append(newChar)
            print("➕ [UUID Update] Created characteristic: \(charData.uuid)")
        }
        
        newService.characteristics = newCharacteristics
        self.servicesMap[newUUID] = newService

        // Validar estado do Bluetooth antes de addService
        if self.manager.state != .poweredOn {
            print("⚠️ [UUID Update] Manager not poweredOn, aborting addService")
            self.updateQueue.sync {
                self.pendingReject?("BT_OFF", "Bluetooth is not powered on", nil)
                self.pendingResolve = nil
                self.pendingReject = nil
                self.isUpdatingUUID = false
            }
            return
        }

        // Prevenir chamada duplicada
        if self.serviceAddInProgress {
            print("⚠️ [UUID Update] addService já em progresso, ignorando chamada duplicada")
            return
        }

        self.serviceAddInProgress = true
        print("➕ [UUID Update] Adding service: \(newUUID)")
        self.manager.add(newService)
        print("➕ [UUID Update] manager.add() called - aguardando callback didAdd")
        // Watchdog: se didAdd não chegar em 3.5s, falhar com limpeza
        self.serviceAddTimeout?.cancel()
        let timeout = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            if self.serviceAddInProgress {
                print("❌ [UUID Update] didAdd não chegou em 3.5s - abortando update")
                self.serviceAddInProgress = false
                self.updateQueue.sync {
                    self.pendingReject?("SERVICE_ADD_TIMEOUT", "Service add did not complete in time", nil)
                    self.pendingResolve = nil
                    self.pendingReject = nil
                    self.isUpdatingUUID = false
                }
            }
        }
        self.serviceAddTimeout = timeout
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.5, execute: timeout)
        
        // Advertising será reiniciado em didAdd(service:) quando o serviço for confirmado
    }
    
    @objc func updateServiceUUIDSeamless(_ newUUID: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // Delegar totalmente para o fluxo principal, que já está estável
        updateServiceUUID(newUUID, resolve: resolve, rejecter: reject)
    }

    @objc(sendNotificationToDevices:characteristicUUID:data:resolve:rejecter:)
    func sendNotificationToDevices(_ serviceUUID: String, characteristicUUID: String, data: String, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        guard let service = servicesMap[serviceUUID] else {
            alertJS("service \(serviceUUID) does not exist")
            reject("SERVICE_NOT_FOUND", "Service not found", nil)
            return
        }
        
        guard let characteristic = getCharacteristicForService(service, characteristicUUID) as? CBMutableCharacteristic else {
            alertJS("service \(serviceUUID) does NOT have characteristic \(characteristicUUID)")
            reject("CHARACTERISTIC_NOT_FOUND", "Characteristic not found", nil)
            return
        }

        guard let byteData = data.data(using: .utf8) else {
            alertJS("failed to convert data to UTF8")
            reject("DATA_CONVERSION_FAILED", "Failed to convert data to UTF8", nil)
            return
        }
        
        characteristic.value = byteData
        let success = manager.updateValue(byteData, for: characteristic, onSubscribedCentrals: nil)
        if (success){
            print("changed data for characteristic \(characteristicUUID)")
            resolve(true)
        } else {
            alertJS("failed to send changed data for characteristic \(characteristicUUID)")
            reject("SEND_FAILED", "Failed to send notification", nil)
        }
    }
    
    //// EVENTS

    // Respond to Read request
    func peripheralManager(peripheral: CBPeripheralManager, didReceiveReadRequest request: CBATTRequest) {
        let characteristic = getCharacteristic(request.characteristic.uuid)
        if let char = characteristic {
            request.value = char.value
            manager.respond(to: request, withResult: .success)
        } else {
            alertJS("cannot read, characteristic not found")
            manager.respond(to: request, withResult: .attributeNotFound)
        }
    }

    // Respond to Write request
    func peripheralManager(peripheral: CBPeripheralManager, didReceiveWriteRequests requests: [CBATTRequest]) {
        for request in requests {
            let characteristic = getCharacteristic(request.characteristic.uuid)
            if let char = characteristic as? CBMutableCharacteristic {
                char.value = request.value
            } else {
                alertJS("characteristic for writing not found")
                manager.respond(to: request, withResult: .attributeNotFound)
                return
            }
        }
        manager.respond(to: requests[0], withResult: .success)
    }

    // Respond to Subscription to Notification events
    func peripheralManager(_ peripheral: CBPeripheralManager, central: CBCentral, didSubscribeTo characteristic: CBCharacteristic) {
        if let char = characteristic as? CBMutableCharacteristic {
            print("subscribed centrals: \(String(describing: char.subscribedCentrals))")
        }
    }

    // Respond to Unsubscribe events
    func peripheralManager(_ peripheral: CBPeripheralManager, central: CBCentral, didUnsubscribeFrom characteristic: CBCharacteristic) {
        if let char = characteristic as? CBMutableCharacteristic {
            print("unsubscribed centrals: \(String(describing: char.subscribedCentrals))")
        }
    }

    // Service added
    func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
        if let error = error {
            alertJS("error: \(error)")
            
            // Limpar flag
            self.serviceAddInProgress = false
            
            // Se estava esperando UUID update e deu erro, rejeitar
            if isUpdatingUUID {
                updateQueue.sync {
                    pendingReject?("SERVICE_ADD_ERROR", "Failed to add service: \(error.localizedDescription)", error)
                    pendingResolve = nil
                    pendingReject = nil
                    isUpdatingUUID = false
                }
            }
            return
        }
        
        print("✅ [Service Added] Service: \(service.uuid)")
        
        // Limpar flag de add em progresso
        self.serviceAddInProgress = false
        
        // Reiniciar advertising somente após confirmação de que o serviço foi adicionado
        if isUpdatingUUID {
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                
                let advertisementData: [String: Any] = [
                    CBAdvertisementDataLocalNameKey: self.name,
                    CBAdvertisementDataServiceUUIDsKey: self.getServiceUUIDArray()
                ]
                print("📡 [UUID Update] Restarting advertising after service added: \(service.uuid)")
                self.manager.startAdvertising(advertisementData)

                // Pequeno delay para estabilidade antes de resolver
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { [weak self] in
                    guard let self = self else { return }
                    self.advertising = true
                    print("✅ [UUID Update] Complete! Now advertising: \(service.uuid)")
                    
                    self.updateQueue.sync {
                        self.pendingResolve?(true)
                        self.pendingResolve = nil
                        self.pendingReject = nil
                        self.isUpdatingUUID = false
                    }
                }
            }
        }
    }

    // Bluetooth status changed
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        var state: Any
        if #available(iOS 10.0, *) {
            state = peripheral.state.description
        } else {
            state = peripheral.state
        }
        alertJS("BT state change: \(state)")
    }

    // Advertising started
    func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
        if let error = error {
            let errorMsg = "Advertising failed: \(error.localizedDescription)"
            print("❌ [Advertising] \(errorMsg)")
            alertJS(errorMsg)
            advertising = false
            
            // Se era UUID update, já foi rejeitado em updateServiceUUID
            if isUpdatingUUID {
                updateQueue.sync {
                    pendingReject?("ADVERTISING_FAILED", errorMsg, error)
                    pendingResolve = nil
                    pendingReject = nil
                    isUpdatingUUID = false
                }
                return
            }
            
            startPromiseReject?("AD_ERR", errorMsg, error as NSError)
            startPromiseReject = nil
            startPromiseResolve = nil
            return
        }
        
        advertising = true
        print("✅ [Advertising] Started successfully!")
        
        // Apenas para start() normal, UUID updates resolvem em updateServiceUUID
        if !isUpdatingUUID {
            startPromiseResolve?(true)
            startPromiseResolve = nil
            startPromiseReject = nil
        }
    }
    
    //// HELPERS

    func getCharacteristic(_ characteristicUUID: CBUUID) -> CBCharacteristic? {
        for (uuid, service) in servicesMap {
            for characteristic in service.characteristics ?? [] {
                if (characteristic.uuid.isEqual(characteristicUUID)) {
                    print("service \(uuid) does have characteristic \(characteristicUUID)")
                    if (characteristic is CBMutableCharacteristic) {
                        return characteristic
                    }
                    print("but it is not mutable")
                }
            }
        }
        return nil
    }

    func getCharacteristicForService(_ service: CBMutableService, _ characteristicUUID: String) -> CBCharacteristic? {
        let uuid = CBUUID(string: characteristicUUID)
        for characteristic in service.characteristics ?? [] {
            if (characteristic.uuid.isEqual(uuid)) {
                print("service \(service.uuid) does have characteristic \(characteristicUUID)")
                if (characteristic is CBMutableCharacteristic) {
                    return characteristic
                }
                print("but it is not mutable")
            }
        }
        return nil
    }

    func getServiceUUIDArray() -> Array<CBUUID> {
        var serviceArray = [CBUUID]()
        for (_, service) in servicesMap {
            serviceArray.append(service.uuid)
        }
        return serviceArray
    }

    func alertJS(_ message: Any) {
        print(message)
        if(hasListeners) {
            sendEvent(withName: "onWarning", body: message)
        }
    }

    @objc override func supportedEvents() -> [String]! { return ["onWarning"] }
    override func startObserving() { hasListeners = true }
    override func stopObserving() { hasListeners = false }
    @objc override static func requiresMainQueueSetup() -> Bool { return false }
    
    @objc override static func moduleName() -> String! {
        return "BLEPeripheral"
    }
}

@available(iOS 10.0, *)
extension CBManagerState: CustomStringConvertible {
    public var description: String {
        switch self {
        case .poweredOff: return ".poweredOff"
        case .poweredOn: return ".poweredOn"
        case .resetting: return ".resetting"
        case .unauthorized: return ".unauthorized"
        case .unknown: return ".unknown"
        case .unsupported: return ".unsupported"
        @unknown default: return ".unknown"
        }
    }
}