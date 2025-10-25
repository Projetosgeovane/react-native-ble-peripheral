require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = "react-native-ble-peripheral"
  s.version      = package["version"] || "1.0.0"
  s.summary      = package["description"] || "React Native BLE Peripheral"
  s.license      = package["license"] || "MIT"
  s.homepage     = package["homepage"] || "https://github.com/SEU-USUARIO/react-native-ble-peripheral"
  s.authors      = package["author"] || { "Seu Nome" => "seu@email.com" }

  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/SEU-USUARIO/react-native-ble-peripheral.git", :tag => s.version.to_s }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React-Core"
end
