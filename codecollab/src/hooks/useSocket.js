import { useEffect, useRef } from 'react'
import { getSocket, EVENTS } from '../services/socket'

export function useSocket(roomId, token, handlers = {}) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!roomId || !token) return

    const socket = getSocket(token)
    socketRef.current = socket

    socket.emit(EVENTS.JOIN_ROOM, { roomId })

    // Register all handlers
    Object.entries(handlers).forEach(([event, fn]) => {
      socket.on(event, fn)
    })

    return () => {
      socket.emit(EVENTS.LEAVE_ROOM, { roomId })
      Object.entries(handlers).forEach(([event, fn]) => {
        socket.off(event, fn)
      })
    }
  }, [roomId, token])

  const emit = (event, data) => socketRef.current?.emit(event, data)

  return { socket: socketRef.current, emit }
}
