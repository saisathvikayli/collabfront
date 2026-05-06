# CodeCollab — Frontend

Real-time collaborative code editor frontend built with React + Vite.

## Folder structure

```
src/
├── pages/
│   ├── LoginPage.jsx          # Login form (JWT)
│   ├── RegisterPage.jsx       # Register form
│   ├── Auth.module.css        # Shared auth styles
│   ├── DashboardPage.jsx      # Room list + create room
│   ├── Dashboard.module.css
│   └── RoomPage.jsx           # Main editor view
│
├── components/
│   ├── layout/
│   │   ├── Topbar.jsx         # Logo, room badge, language, Run btn
│   │   ├── RightPanel.jsx     # Chat / History / Settings tabs
│   │   └── ProtectedRoute.jsx # Auth guard
│   ├── sidebar/
│   │   └── Sidebar.jsx        # Online users, live activity, files
│   ├── editor/
│   │   ├── EditorTabBar.jsx   # File tabs + Diff/Fold/Format actions
│   │   ├── OutputPanel.jsx    # Output / Problems / Terminal
│   │   └── BottomBar.jsx      # Find, Commit, Follow, Save
│   └── chat/
│       └── ChatPanel.jsx      # Real-time chat messages
│
├── context/
│   └── AuthContext.jsx        # JWT auth state (login/register/logout)
│
├── hooks/
│   ├── useCollabEditor.js     # Yjs CRDT + WebSocket provider
│   └── useSocket.js           # Socket.io room events
│
├── services/
│   ├── api.js                 # Axios instance + auth interceptor + roomsApi
│   └── socket.js              # Socket.io singleton + event constants
│
└── styles/
    └── global.css             # CSS variables, resets, scrollbar
```

## Backend API expected

| Method | Endpoint            | Body / Params           | Description              |
|--------|---------------------|-------------------------|--------------------------|
| POST   | /api/auth/register  | name, email, password   | Returns { token, user }  |
| POST   | /api/auth/login     | email, password         | Returns { token, user }  |
| GET    | /api/auth/me        | —                       | Returns { user }         |
| GET    | /api/rooms          | —                       | Returns { rooms[] }      |
| POST   | /api/rooms          | name, language          | Returns { room }         |
| GET    | /api/rooms/:id      | —                       | Returns { room }         |
| DELETE | /api/rooms/:id      | —                       | 204                      |
| POST   | /api/rooms/:id/invite | email               | Invite user              |

## MongoDB schema (user doc)

```json
{
  "_id": "ObjectId",
  "name": "Arjun",
  "email": "arjun@example.com",
  "passwordHash": "...",
  "createdAt": "ISODate",
  "rooms": ["ObjectId"]
}
```

## MongoDB schema (room doc)

```json
{
  "_id": "ObjectId",
  "roomCode": "A7X92",
  "name": "Interview Prep",
  "language": "python",
  "code": "...",
  "owner": "ObjectId",
  "members": ["ObjectId"],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

## Socket.io events

| Event           | Direction        | Payload                        |
|-----------------|------------------|--------------------------------|
| room:join       | client → server  | { roomId }                     |
| room:leave      | client → server  | { roomId }                     |
| room:users      | server → client  | User[]                         |
| code:change     | client → server  | { roomId, code }               |
| code:sync       | server → client  | { code }                       |
| cursor:move     | client → server  | { roomId, line, column }       |
| cursor:update   | server → client  | { userId, line, column }       |
| chat:send       | client → server  | { roomId, text, userName }     |
| chat:message    | server → client  | { userId, userName, text, ts } |
| activity:log    | server → client  | string                         |
| code:run        | client → server  | { roomId, code, language }     |

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```
