import { ParsedCallbackResult } from '../types/Callback.js';
import { PaymentRecord } from '../types/Payment.js';

export type EventMap = {
  success: (data: { payment: PaymentRecord; callback: ParsedCallbackResult }) => void;
  failed: (data: { payment: PaymentRecord; callback: ParsedCallbackResult }) => void;
  cancelled: (data: { payment: PaymentRecord; callback: ParsedCallbackResult }) => void;
  error: (error: Error) => void;
};

export class EventBus {
  private listeners: { [K in keyof EventMap]?: Set<EventMap[K]> } = {};

  on<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as any;
    }
    (this.listeners[event] as Set<EventMap[K]>).add(listener);
  }

  off<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
    if (this.listeners[event]) {
      (this.listeners[event] as Set<EventMap[K]>).delete(listener);
    }
  }

  emit<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>): void {
    if (this.listeners[event]) {
      this.listeners[event]!.forEach((listener) => {
        try {
          (listener as any)(...args);
        } catch (err) {
          console.error(`Unhandled error inside event listener for "${event}":`, err);
        }
      });
    }
  }
}