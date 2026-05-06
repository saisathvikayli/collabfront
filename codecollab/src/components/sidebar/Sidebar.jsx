import React from 'react'
import styles from './Sidebar.module.css'

const COLORS = {
  AR: 'var(--user-ar)',
  PR: 'var(--user-pr)',
  KR: 'var(--user-kr)',
  default: 'var(--user-you)'
}

function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function getColor(initials) {
  return COLORS[initials] || COLORS.default
}

export default function Sidebar({ users = [], activity = [], files = [], activeFile, onFileSelect, onNewFile }) {
  return (
    <aside className={styles.sidebar}>
      {/* Online users */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Online ({users.length})</h3>
        <ul className={styles.userList}>
          {users.map(u => {
            const initials = getInitials(u.name)
            const color    = getColor(initials)
            return (
              <li key={u.id} className={styles.userItem}>
                <div className={styles.avatarWrap}>
                  <span
                    className={styles.avatar}
                    style={{ background: color + '22', color, border: `1px solid ${color}44` }}
                  >
                    {initials}
                  </span>
                  <span className={styles.onlineDot} style={{ background: color }} />
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {u.name} {u.isYou && <em className={styles.you}>you</em>}
                  </span>
                  <span className={styles.userStatus}>{u.status || 'idle'}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Live activity */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Live Activity</h3>
        <ul className={styles.activityList}>
          {activity.slice(0, 6).map((a, i) => (
            <li key={i} className={styles.activityItem}>
              <span className={styles.activityDot} />
              <span className={styles.activityText}>{a}</span>
            </li>
          ))}
          {activity.length === 0 && (
            <li className={styles.activityEmpty}>No activity yet</li>
          )}
        </ul>
      </section>

      {/* Files */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Files</h3>
        <ul className={styles.fileList}>
          {files.map(f => (
            <li key={f.name}>
              <button
                className={`${styles.fileItem} ${activeFile === f.name ? styles.fileActive : ''}`}
                onClick={() => onFileSelect?.(f.name)}
              >
                <span className={styles.fileIcon}>{getFileIcon(f.name)}</span>
                <span className={styles.fileName}>{f.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <button className={styles.newFileBtn} onClick={onNewFile}>
          + New file
        </button>
      </section>
    </aside>
  )
}

function getFileIcon(name) {
  if (name.endsWith('.py'))  return '🐍'
  if (name.endsWith('.js') || name.endsWith('.jsx')) return '🟨'
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return '🔷'
  if (name.endsWith('.md'))  return '📝'
  if (name.endsWith('.json')) return '📦'
  return '📄'
}
