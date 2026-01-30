import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged } from "firebase/auth"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore"
import { auth, db } from "../../lib/firebase"

export default function BoardPage() {
  const router = useRouter()
  const { id } = router.query

  const [user, setUser] = useState(null)
  const [board, setBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [activity, setActivity] = useState([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [newColumn, setNewColumn] = useState("")

  // 🔐 Auth
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      if (!u) router.push("/login")
      else setUser(u)
    })
  }, [])

  // 📡 Board
  useEffect(() => {
    if (!id) return

    return onSnapshot(doc(db, "boards", id), snap => {
      if (!snap.exists()) return router.push("/dashboard")
      setBoard({ id: snap.id, ...snap.data() })
    })
  }, [id])

  // 📦 Columns
  useEffect(() => {
    if (!id) return

    return onSnapshot(collection(db, "boards", id, "columns"), snap => {
      setColumns(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [id])

  // 📜 Activity
  useEffect(() => {
    if (!id) return

    const q = query(
      collection(db, "boards", id, "activity"),
      orderBy("createdAt", "desc")
    )

    return onSnapshot(q, snap => {
      setActivity(snap.docs.map(d => d.data()))
    })
  }, [id])

  // 🧾 Activity logger
  const log = async (text) => {
    await addDoc(collection(db, "boards", id, "activity"), {
      text,
      createdAt: serverTimestamp()
    })
  }

  // ➕ Column
  const addColumn = async () => {
    if (!newColumn.trim()) return
    await addDoc(collection(db, "boards", id, "columns"), {
      title: newColumn,
      createdAt: serverTimestamp()
    })
    await log(`${user.email} added a column`)
    setNewColumn("")
  }

  // ➕ Task
  const addTask = async (columnId) => {
    const text = prompt("Task title")
    if (!text) return

    await addDoc(
      collection(db, "boards", id, "columns", columnId, "tasks"),
      {
        text,
        createdAt: serverTimestamp()
      }
    )
    await log(`${user.email} added a task`)
  }

  // 👥 Invite collaborator
  const invite = async () => {
    if (!inviteEmail) return alert("Enter email")

    const snap = await getDoc(doc(db, "users", inviteEmail))
    if (!snap.exists()) return alert("User not found")

    await updateDoc(doc(db, "boards", id), {
      members: [...new Set([...board.members, snap.data().uid])]
    })

    await log(`${inviteEmail} was invited`)
    setInviteEmail("")
  }

  // ✏️ Rename board
  const rename = async () => {
    const name = prompt("New board name", board.title)
    if (!name) return
    await updateDoc(doc(db, "boards", id), { title: name })
    await log(`${user.email} renamed the board`)
  }

  // ❌ Delete board
  const remove = async () => {
    if (!confirm("Delete this board?")) return
    await deleteDoc(doc(db, "boards", id))
    router.push("/dashboard")
  }

  if (!board) return <p>Loading…</p>

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h2>{board.title}</h2>
        <div>
          <button onClick={rename}>Rename</button>
          <button onClick={remove}>Delete</button>
        </div>
      </div>

      {/* Invite */}
      <div style={styles.invite}>
        <input
          placeholder="Invite by email"
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
        />
        <button onClick={invite}>Invite</button>
      </div>

      {/* Columns */}
      <div style={styles.columns}>
        {columns.map(col => (
          <div key={col.id} style={styles.column}>
            <h4>{col.title}</h4>
            <Tasks boardId={id} columnId={col.id} />
            <button onClick={() => addTask(col.id)}>+ Task</button>
          </div>
        ))}

        <div style={styles.column}>
          <input
            placeholder="New column"
            value={newColumn}
            onChange={e => setNewColumn(e.target.value)}
          />
          <button onClick={addColumn}>Add</button>
        </div>
      </div>

      {/* Activity */}
      <div style={styles.activity}>
        <h4>Activity</h4>
        {activity.map((a, i) => (
          <p key={i}>• {a.text}</p>
        ))}
      </div>
    </div>
  )
}

/* 🔹 Tasks component */
function Tasks({ boardId, columnId }) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    return onSnapshot(
      collection(db, "boards", boardId, "columns", columnId, "tasks"),
      snap => setTasks(snap.docs.map(d => d.data()))
    )
  }, [])

  return tasks.map((t, i) => (
    <div key={i} style={styles.task}>{t.text}</div>
  ))
}

/* 🎨 UI */
const styles = {
  page: { padding: 20, background: "#eceff1", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between" },
  invite: { margin: "10px 0" },
  columns: { display: "flex", gap: 12, overflowX: "auto" },
  column: {
    background: "#fff",
    padding: 12,
    width: 250,
    borderRadius: 8
  },
  task: {
    background: "#e3f2fd",
    padding: 8,
    borderRadius: 6,
    marginBottom: 6
  },
  activity: {
    marginTop: 20,
    background: "#fff",
    padding: 12,
    borderRadius: 8
  }
}
