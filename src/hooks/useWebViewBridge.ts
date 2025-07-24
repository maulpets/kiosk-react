'use client';

import { useEffect, useCallback } from 'react';
import { useAppContext } from '@/store/AppContext';
import { webViewBridge } from '@/lib/webview/bridge';
import { NativeMessage } from '@/types/webview';
import { MESSAGE_TYPES } from '@/constants';

export function useWebViewBridge() {
  const { setNativeConnection, state } = useAppContext();

  useEffect(() => {
    // Check if we're connected to native
    const isConnected = webViewBridge.isConnectedToNative();
    setNativeConnection(isConnected);

    // Listen for native connection status
    const unsubscribe = webViewBridge.onMessage(
      MESSAGE_TYPES.NATIVE_RESPONSE,
      (message: NativeMessage) => {
        if (message.action === 'READY') {
          setNativeConnection(true);
        }
      }
    );

    return unsubscribe;
  }, [setNativeConnection]);

  const sendToNative = useCallback((action: string, payload?: unknown) => {
    webViewBridge.requestNativeAction(action, payload);
  }, []);

  const onNativeMessage = useCallback((type: string, callback: (message: NativeMessage) => void) => {
    return webViewBridge.onMessage(type, callback);
  }, []);

  return {
    sendToNative,
    onNativeMessage,
    isConnected: state.isConnectedToNative,
  };
}
