// Heart rate monitor connection over Web Bluetooth (standard BLE Heart Rate Service).
//
// Events dispatched on `heartRate` (an EventTarget):
//   'statechange'  detail: { state, reason }  state is one of STATE.*
//   'reading'      detail: { bpm, contact, rr }
//   'battery'      detail: { level }
//
// Dropped-connection handling (specs/app-architecture.md#dropped-connection):
// one automatic reconnect attempt, no app-defined timeout, then 'disconnected'
// with reason 'lost'. A user-initiated disconnect never reconnects.

export const STATE = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
};

class HeartRateMonitor extends EventTarget {
  constructor() {
    super();
    this.state = STATE.DISCONNECTED;
    this.device = null;
    this.userDisconnect = false;
    this.onGattDisconnected = this.onGattDisconnected.bind(this);
    this.onMeasurement = this.onMeasurement.bind(this);
  }

  get supported() {
    return 'bluetooth' in navigator;
  }

  get deviceName() {
    return (this.device && this.device.name) || 'heart rate monitor';
  }

  setState(state, reason = null) {
    this.state = state;
    this.dispatchEvent(new CustomEvent('statechange', { detail: { state, reason } }));
  }

  // Opens the device picker, then connects. Must be called from a user gesture.
  // Throws if the user cancels the picker (NotFoundError) or the connection fails.
  async connect() {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['battery_service'],
    });

    if (this.device && this.device !== device) {
      this.device.removeEventListener('gattserverdisconnected', this.onGattDisconnected);
    }
    this.device = device;
    device.addEventListener('gattserverdisconnected', this.onGattDisconnected);
    this.userDisconnect = false;

    this.setState(STATE.CONNECTING);
    try {
      await this.startGatt();
    } catch (err) {
      // State is still CONNECTING, so onGattDisconnected ignores this cleanup.
      if (device.gatt.connected) device.gatt.disconnect();
      this.setState(STATE.DISCONNECTED, 'failed');
      throw err;
    }
    this.setState(STATE.CONNECTED);
  }

  disconnect() {
    this.userDisconnect = true;
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect(); // fires gattserverdisconnected
    } else {
      this.setState(STATE.DISCONNECTED, 'user');
    }
  }

  async startGatt() {
    const server = await this.device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    const characteristic = await service.getCharacteristic('heart_rate_measurement');
    characteristic.addEventListener('characteristicvaluechanged', this.onMeasurement);
    await characteristic.startNotifications();
    this.readBattery(server);
  }

  async onGattDisconnected() {
    if (this.userDisconnect) {
      this.setState(STATE.DISCONNECTED, 'user');
      return;
    }
    // Only a drop from an established connection gets the reconnect attempt.
    if (this.state !== STATE.CONNECTED) return;

    this.setState(STATE.RECONNECTING);
    try {
      await this.startGatt(); // one attempt; the browser's own timeout applies
      this.setState(STATE.CONNECTED);
    } catch (_) {
      this.setState(STATE.DISCONNECTED, 'lost');
    }
  }

  // Parses the Heart Rate Measurement characteristic (0x2A37).
  onMeasurement(event) {
    const data = event.target.value;
    const flags = data.getUint8(0);
    const is16Bit = flags & 0x01;
    const contactSupported = flags & 0x04;
    const contactDetected = flags & 0x02;
    const hasEnergy = flags & 0x08;
    const hasRR = flags & 0x10;

    let offset = 1;
    const bpm = is16Bit ? data.getUint16(offset, true) : data.getUint8(offset);
    offset += is16Bit ? 2 : 1;
    if (hasEnergy) offset += 2;

    const rr = [];
    if (hasRR) {
      for (; offset + 1 < data.byteLength; offset += 2) {
        rr.push(Math.round((data.getUint16(offset, true) / 1024) * 1000));
      }
    }

    const contact = contactSupported ? Boolean(contactDetected) : null;
    this.dispatchEvent(new CustomEvent('reading', { detail: { bpm, contact, rr } }));
  }

  async readBattery(server) {
    try {
      const service = await server.getPrimaryService('battery_service');
      const characteristic = await service.getCharacteristic('battery_level');
      const value = await characteristic.readValue();
      this.dispatchEvent(new CustomEvent('battery', { detail: { level: value.getUint8(0) } }));
    } catch (_) {
      // Battery level is optional; not every strap exposes it.
    }
  }
}

export const heartRate = new HeartRateMonitor();
