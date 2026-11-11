// ==========================================
// CONFIGURACIÓN BLE (UUIDs del ESP32)
// ==========================================
const BLE_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const BLE_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

let bleDevice = null;
let bleCharacteristic = null;

// ==========================================
// CONEXIÓN CON EL ESP32
// ==========================================
async function connectBLE() {
  // Verificar si el navegador soporta Web Bluetooth
  if (!navigator.bluetooth) {
    showToast(
      "Tu navegador no soporta Web Bluetooth. Usa Chrome o Edge.",
      "error",
    );
    return;
  }

  try {
    showToast("Buscando ESP32_Autorregulacion...", "info");

    // 1. Solicitud al usuario para seleccionar el ESP32
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ name: "ESP32_Autorregulacion" }],
      optionalServices: [BLE_SERVICE_UUID],
    });

    // Escuchar si el ESP32 se desconecta inesperadamente
    bleDevice.addEventListener("gattserverdisconnected", onDisconnected);

    // 2. Conectar al Servidor GATT
    const server = await bleDevice.gatt.connect();

    // 3. Obtener el Servicio
    const service = await server.getPrimaryService(BLE_SERVICE_UUID);

    // 4. Obtener la Característica de escritura
    bleCharacteristic = await service.getCharacteristic(
      BLE_CHARACTERISTIC_UUID,
    );

    // Actualizar interfaz
    updateBLEState(true);
    showToast("¡ESP32 Conectado con éxito!", "success");
  } catch (error) {
    console.error("Error al conectar Bluetooth:", error);
    updateBLEState(false);
    if (error.name !== "NotFoundError") {
      // El usuario no canceló la ventana
      showToast("No se pudo conectar con el ESP32", "error");
    }
  }
}

// ==========================================
// DESCONEXIÓN
// ==========================================
function disconnectBLE() {
  if (bleDevice && bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect();
  }
  onDisconnected();
}

function onDisconnected() {
  bleCharacteristic = null;
  updateBLEState(false);
  showToast("ESP32 Desconectado", "warning");
}

// ==========================================
// ENVÍO DE DATOS A LOS NEOPIXELS ('R', 'Y', 'G')
// ==========================================
async function sendResultToESP32(command) {
  if (!bleCharacteristic) {
    console.warn("ESP32 no conectado. El comando no fue enviado:", command);
    return;
  }

  try {
    // Convertir el carácter ('R', 'Y' o 'G') a bytes uint8
    const encoder = new TextEncoder();
    await bleCharacteristic.writeValue(encoder.encode(command));
    console.log(`Comando '${command}' enviado al ESP32`);
  } catch (error) {
    console.error("Error al enviar datos al ESP32:", error);
    showToast("Error al transmitir al ESP32", "error");
  }
}

// ==========================================
// ACTUALIZACIÓN DE INTERFAZ DEL BOTÓN BLE
// ==========================================
function updateBLEState(isConnected) {
  const btn = document.getElementById("btn-connect-ble");
  const icon = document.getElementById("ble-status-icon");
  const text = document.getElementById("ble-status-text");

  if (!btn) return;

  if (isConnected) {
    btn.className =
      "flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full transition hover:bg-emerald-100";
    if (icon)
      icon.className = "fa-solid fa-bluetooth text-emerald-600 animate-pulse";
    if (text) text.textContent = "ESP32 Conectado";
  } else {
    btn.className =
      "flex items-center gap-2 text-xs font-semibold text-powder-blue-700 bg-powder-blue-100 border border-powder-blue-300 px-3 py-1.5 rounded-full transition hover:bg-powder-blue-200";
    if (icon) icon.className = "fa-brands fa-bluetooth-b text-powder-blue-600";
    if (text) text.textContent = "Conectar ESP32";
  }
}

// ==========================================
// UTILIDAD TOAST (NOTIFICACIONES)
// ==========================================
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;

  if (type === "success") {
    toastIcon.className = "fa-solid fa-circle-check text-emerald-400";
  } else if (type === "error") {
    toastIcon.className = "fa-solid fa-circle-xmark text-rose-400";
  } else if (type === "warning") {
    toastIcon.className = "fa-solid fa-triangle-exclamation text-amber-400";
  } else {
    toastIcon.className = "fa-solid fa-bluetooth text-powder-blue-300";
  }

  toast.classList.remove("translate-y-20", "opacity-0");

  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
  }, 3500);
}
