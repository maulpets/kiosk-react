// React Native WebView message types
export interface WebViewMessage {
  type: string;
  payload?: unknown;
  id?: string;
}

export interface NativeMessage extends WebViewMessage {
  type: 'NATIVE_ACTION' | 'NATIVE_RESPONSE' | 'NATIVE_ERROR';
  action?: string;
}

export interface WebMessage extends WebViewMessage {
  type: 'WEB_ACTION' | 'WEB_RESPONSE' | 'WEB_READY';
}
