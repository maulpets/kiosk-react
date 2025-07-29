import { NativeMessage, WebMessage } from '@/types/webview';
import { MESSAGE_TYPES } from '@/constants';

class WebViewBridge {
  private messageQueue: WebMessage[] = [];
  private isNativeReady = false;
  private listeners: Map<string, ((message: NativeMessage) => void)[]> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeListener();
      this.notifyWebReady();
    }
  }

  private initializeListener() {
    // Listen for messages from React Native
    window.addEventListener('message', this.handleNativeMessage.bind(this));
    
    // For Android WebView
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.onMessage = this.handleNativeMessage.bind(this);
    }
  }

  private handleNativeMessage(event: MessageEvent) {
    try {
      const message: NativeMessage = JSON.parse(event.data);
      
      if (message.type === MESSAGE_TYPES.NATIVE_RESPONSE && message.action === 'READY') {
        this.isNativeReady = true;
        this.flushMessageQueue();
      }

      // Notify listeners
      const typeListeners = this.listeners.get(message.type) || [];
      typeListeners.forEach(listener => listener(message));
    } catch (error) {
      console.error('Failed to parse message from native:', error);
    }
  }

  private notifyWebReady() {
    this.sendToNative({
      type: MESSAGE_TYPES.WEB_READY,
      payload: { timestamp: Date.now() }
    });
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendToNative(message);
      }
    }
  }

  sendToNative(message: WebMessage) {
    if (!this.isNativeReady) {
      this.messageQueue.push(message);
      return;
    }

    const messageString = JSON.stringify(message);
    
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(messageString);
    } else if (window.webkit?.messageHandlers?.reactNativeWebView) {
      // iOS WebKit
      window.webkit.messageHandlers.reactNativeWebView.postMessage(messageString);
    } else {
      console.warn('React Native WebView not detected');
    }
  }

  onMessage(type: string, callback: (message: NativeMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        const index = typeListeners.indexOf(callback);
        if (index > -1) {
          typeListeners.splice(index, 1);
        }
      }
    };
  }

  // Convenience methods
  requestNativeAction(action: string, payload?: unknown) {
    this.sendToNative({
      type: MESSAGE_TYPES.WEB_ACTION,
      payload: { action, data: payload },
      id: `${Date.now()}-${Math.random()}`
    });
  }

  isConnectedToNative(): boolean {
    return this.isNativeReady;
  }
}

// Global instance
export const webViewBridge = new WebViewBridge();

// Type declarations for window object
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
      onMessage?: (event: MessageEvent) => void;
    };
    webkit?: {
      messageHandlers?: {
        reactNativeWebView?: {
          postMessage: (message: string) => void;
        };
      };
    };
  }
}
