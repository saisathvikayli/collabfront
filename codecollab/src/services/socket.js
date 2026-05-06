import { io } from 'socket.io-client'

let socket = null

export const getSocket = (token) => {
  if (!socket) {
    socket = io('/', {
      auth: { token },
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}

/* ── Event helpers ── */
export const EVENTS = {
  // Room
  JOIN_ROOM:    'room:join',
  LEAVE_ROOM:   'room:leave',
  ROOM_USERS:   'room:users',

  // Code
  CODE_CHANGE:  'code:change',
  CODE_SYNC:    'code:sync',

  // Cursor / Presence
  CURSOR_MOVE:  'cursor:move',
  CURSOR_UPDATE:'cursor:update',

  // Chat
  CHAT_SEND:    'chat:send',
  CHAT_MESSAGE: 'chat:message',

  // Activity
  ACTIVITY:     'activity:log'
}
