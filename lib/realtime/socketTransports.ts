/**
 * Polling first, then upgrade: socket.io-client never falls back from a blocked
 * WebSocket (ad blockers, corporate proxies) to polling on its own.
 */
export const SOCKET_TRANSPORTS = ['polling', 'websocket']
