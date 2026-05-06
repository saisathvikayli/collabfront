import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roomsApi } from '../services/api'
import styles from './Dashboard.module.css'

const LANGS = ['python', 'javascript', 'typescript', 'cpp', 'java', 'go', 'rust']

function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [rooms, setRooms]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newRoom, setNewRoom]     = useState({ name: '', language: 'python' })
  const [creating, setCreating]   = useState(false)

  useEffect(() => {
    roomsApi.list()
      .then(r => setRooms(r.data.rooms || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async e => {
    e.preventDefault()
    if (!newRoom.name.trim()) return
    setCreating(true)
    try {
      const { data } = await roomsApi.create(newRoom.name.trim(), newRoom.language)
      navigate(`/room/${data.room._id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>&lt;/&gt;</span>
          <span className={styles.brandName}>CodeCollab</span>
        </div>
        <div className={styles.userArea}>
          <span className={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</span>
          <div className={styles.avatar} title={user?.name}>
            {getInitials(user?.name)}
          </div>
          <button className={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.heroRow}>
          <div>
            <h1 className={styles.title}>Your Rooms</h1>
            <p className={styles.subtitle}>Open a room to start collaborating in real time.</p>
          </div>
          <button className={styles.newBtn} onClick={() => setShowModal(true)}>
            + New Room
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingGrid}>
            {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>⌨️</span>
            <p>No rooms yet. Create one to get started.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {rooms.map(room => (
              <button
                key={room._id}
                className={styles.roomCard}
                onClick={() => navigate(`/room/${room._id}`)}
              >
                <div className={styles.roomHeader}>
                  <span className={styles.langBadge}>{room.language}</span>
                  <span className={styles.roomId}>#{room.roomCode}</span>
                </div>
                <h3 className={styles.roomName}>{room.name}</h3>
                <div className={styles.roomMeta}>
                  <span className={styles.memberCount}>{room.members?.length ?? 1} member{room.members?.length !== 1 ? 's' : ''}</span>
                  <span className={styles.roomDate}>{new Date(room.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create room modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Create a new room</h2>
            <form onSubmit={handleCreate} className={styles.modalForm}>
              <label className={styles.modalLabel}>Room name</label>
              <input
                className={styles.modalInput}
                placeholder="e.g. Interview Prep"
                value={newRoom.name}
                onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))}
                autoFocus required
              />
              <label className={styles.modalLabel}>Language</label>
              <select
                className={styles.modalInput}
                value={newRoom.language}
                onChange={e => setNewRoom(r => ({ ...r, language: e.target.value }))}
              >
                {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.createBtn} disabled={creating}>
                  {creating ? 'Creating…' : 'Create Room →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
