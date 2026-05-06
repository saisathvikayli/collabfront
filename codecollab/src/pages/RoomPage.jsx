import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { roomsApi } from '../services/api'
import { useSocket } from '../hooks/useSocket'
import { EVENTS } from '../services/socket'

import Topbar        from '../components/layout/Topbar'
import Sidebar       from '../components/sidebar/Sidebar'
import EditorTabBar  from '../components/editor/EditorTabBar'
import OutputPanel   from '../components/editor/OutputPanel'
import BottomBar     from '../components/editor/BottomBar'
import RightPanel    from '../components/layout/RightPanel'

import styles from './RoomPage.module.css'

// Lazy-load Monaco to avoid SSR issues
import { Editor as MonacoEditor } from '@monaco-editor/react'

const DEFAULT_CODE = {
  python:     '# Welcome to CodeCollab!\ndef greet(name):\n    print(f"Hello, {name}!")\n\ndef add(a, b):\n    return a + b\n\n# Main execution\ngreet("CodeCollab")\nresult = add(10, 20)\nprint(f"Result: {result}")\n',
  javascript: '// Welcome to CodeCollab!\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\n\nfunction add(a, b) {\n  return a + b;\n}\n\ngreet("CodeCollab");\nconst result = add(10, 20);\nconsole.log("Result:", result);\n',
}

const LANG_MAP = {
  python: 'python', javascript: 'javascript', typescript: 'typescript',
  cpp: 'cpp', java: 'java', go: 'go', rust: 'rust'
}

export default function RoomPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user, token } = useAuth()

  const [room, setRoom]       = useState(null)
  const [language, setLang]   = useState('python')
  const [code, setCode]       = useState(DEFAULT_CODE.python)
  const [output, setOutput]   = useState('')
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [activity, setActivity] = useState([])
  const [problems, setProblems] = useState([])
  const [autoSaved, setAutoSaved] = useState(null)
  const [activeFile, setActiveFile] = useState('main.py')
  const [tabs, setTabs] = useState([
    { name: 'main.py', modified: false },
    { name: 'utils.py', modified: false }
  ])
  const [files] = useState([
    { name: 'main.py' }, { name: 'utils.py' }, { name: 'README.md' }
  ])

  const editorRef = useRef(null)
  const autoSaveTimer = useRef(null)

  // Socket events
  const { emit } = useSocket(id, token, {
    [EVENTS.ROOM_USERS]:   setOnlineUsers,
    [EVENTS.CODE_SYNC]:    ({ code: c }) => setCode(c),
    [EVENTS.CHAT_MESSAGE]: msg => setMessages(ms => [...ms, msg]),
    [EVENTS.ACTIVITY]:     msg => setActivity(a => [msg, ...a].slice(0, 10))
  })

  // Load room meta
  useEffect(() => {
    roomsApi.get(id)
      .then(r => {
        setRoom(r.data.room)
        setLang(r.data.room.language || 'python')
        if (r.data.room.code) setCode(r.data.room.code)
      })
      .catch(() => navigate('/dashboard'))
  }, [id])

  // Auto-save
  const handleCodeChange = useCallback(val => {
    setCode(val)
    emit(EVENTS.CODE_CHANGE, { roomId: id, code: val })
    clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await roomsApi.get(id) // replace with save endpoint
        const now = new Date()
        setAutoSaved(`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`)
      } catch(_) {}
    }, 2000)
  }, [id, emit])

  const handleRun = () => {
    setRunning(true)
    setOutput('$ python main.py\n')
    emit('code:run', { roomId: id, code, language })
    // Simulated output for UI demo
    setTimeout(() => {
      setOutput('$ python main.py\nHello, CodeCollab!\nResult: 30\n')
      setRunning(false)
    }, 1200)
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
  }

  const handleSendMessage = useCallback(text => {
    const msg = { userId: user?.id, userName: user?.name, text, timestamp: Date.now(), color: '#63b3ed' }
    setMessages(ms => [...ms, msg])
    emit(EVENTS.CHAT_SEND, { roomId: id, ...msg })
  }, [user, id, emit])

  const currentUserPresence = {
    id: user?.id, name: user?.name || 'You', isYou: true, status: 'editing main.py'
  }
  const allUsers = [currentUserPresence, ...onlineUsers.filter(u => u.id !== user?.id)]

  if (!room) {
    return (
      <div className={styles.loading}>
        <span className={styles.loadingIcon}>&lt;/&gt;</span>
        <p>Connecting to room…</p>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <Topbar
        roomCode={room.roomCode}
        language={language}
        onLanguageChange={l => { setLang(l); setCode(DEFAULT_CODE[l] || code) }}
        onRun={handleRun}
        running={running}
        onCopy={handleCopy}
        onShare={handleShare}
      />

      <div className={styles.body}>
        {/* Left sidebar */}
        <Sidebar
          users={allUsers}
          activity={activity}
          files={files}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
        />

        {/* Editor area */}
        <div className={styles.editorArea}>
          <EditorTabBar
            tabs={tabs}
            activeTab={activeFile}
            onTabSelect={setActiveFile}
            onTabClose={name => setTabs(t => t.filter(x => x.name !== name))}
          />

          {/* Monaco editor */}
          <div className={styles.editorWrapper}>
            <MonacoEditor
              height="100%"
              language={LANG_MAP[language] || 'python'}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              onMount={e => { editorRef.current = e }}
              options={{
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineHeight: 22,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true }
              }}
            />
          </div>

          {/* Bottom bar */}
          <BottomBar
            users={allUsers.filter(u => !u.isYou)}
            autoSavedAt={autoSaved}
            onSave={() => {
              const now = new Date()
              setAutoSaved(`${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`)
            }}
          />

          {/* Output panel */}
          <div className={styles.outputArea}>
            <OutputPanel
              output={output}
              problems={problems}
              onClear={() => setOutput('')}
            />
          </div>
        </div>

        {/* Right panel */}
        <RightPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          currentUser={{ id: user?.id, name: user?.name }}
          history={[]}
        />
      </div>
    </div>
  )
}
