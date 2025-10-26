#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(BLEPeripheral, RCTEventEmitter)

RCT_EXTERN_METHOD(setName:(NSString *)name)
RCT_EXTERN_METHOD(isAdvertising:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(addService:(NSString *)uuid primary:(BOOL)primary)
RCT_EXTERN_METHOD(addCharacteristicToService:(NSString *)serviceUUID uuid:(NSString *)uuid permissions:(NSInteger)permissions properties:(NSInteger)properties data:(NSString *)data)
RCT_EXTERN_METHOD(start:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stop:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(updateServiceUUID:(NSString *)newUUID resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendNotificationToDevices:(NSString *)serviceUUID characteristicUUID:(NSString *)characteristicUUID data:(NSString *)data resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end