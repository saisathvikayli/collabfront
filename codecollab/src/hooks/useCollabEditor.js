import { useEffect, useRef, useState, useCallback } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000'

/**
 * Hook: manages Yjs CRDT doc + WebSocket provider for a room.
 * Returns: { ydoc, provider, awareness, connected }
 */
export function useCollabEditor(roomId, user) {
  const ydocRef     = useRef(null)
  const providerRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!roomId || !user) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new WebsocketProvider(
      `${WS_URL}/yjs`,
      `room-${roomId}`,
      ydoc,
      { params: { token: localStorage.getItem('cc_token') } }
    )
    providerRef.current = provider

    // Set local awareness (presence)
    provider.awareness.setLocalStateField('user', {
      id:    user.id,
      name:  user.name,
      color: user.color || '#63b3ed'
    })

    provider.on('status', ({ status }) => setConnected(status === 'connected'))

    return () => {
      provider.destroy()
      ydoc.destroy()
    }
  }, [roomId, user?.id])

  return {
    ydoc:      ydocRef.current,
    provider:  providerRef.current,
    awareness: providerRef.current?.awareness,
    connected
  }
}
