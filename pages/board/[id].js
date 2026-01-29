import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { auth, db } from "../../lib/firebase"
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore"

/* =========================
   MAIN BOARD PAGE
========================= */
export default function BoardPage() {
  const router = useRouter()
  const { id: boardId } = router.query
  const [columns, setColumns] = useState([])
  const [newColumn, setNewColumn] = useState("")

  useEffect(() => {
    if (!boardId) return

    const q = query(
      collection(db, "columns"),
      where("boardId", "==", boardId),
      orderBy("order")
    )

    const unsub = onSnapshot(q, (snap) => {
      setColumns(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => unsub()
  }, [boardId])

  const addColumn = async () => {
    if (!newColumn) return

    await addDoc(collection(db, "columns"), {
      boardId,
      name: newColumn,
      order: Date.now(),
    })

    setNewColumn("")
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Board</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="New column name"
          value={newColumn}
          onChange={e => setNewColumn(e.target.value)}
        />
        <button onClick={addColumn}>Add Column</button>
      </div>

      <div style={{ display: "flex", gap: 20, overflowX: "auto" }}>
        {columns.map(col => (
          <Column key={col.id} column={col} />
        ))}
      </div>

      <Invite boardId={boardId} />
    </div>
  )
}

/* =========================
   COLUMN + TASKS
========================= */
function Column({ column }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")

  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("columnId", "==", column.id),
      orderBy("createdAt")
    )

    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => unsub()
  }, [column.id])

  const addTask = async () => {
    if (!newTask) return

    await addDoc(collection(db, "tasks"), {
      title: newTask,
      columnId: column.id,
      boardId: column.boardId,
      createdAt: Date.now(),
    })

    setNewTask("")
  }

  return (
    <div
      style={{
        minWidth: 250,
        background: "#f4f5f7",
        padding: 10,
        borderRadius: 6,
      }}
    >
      <h3>{column.name}</h3>

      {tasks.map(task => (
        <div
          key={task.id}
          style={{
            background: "#fff",
            padding: 8,
            marginBottom: 6,
            borderRadius: 4,
          }}
        >
          {task.title}
        </div>
      ))}

      <input
        placeholder="New task"
        value={newTask}
        onChange={e => setNewTask(e.target.value)}
      />
      <button onClick={addTask}>Add</button>
    </div>
  )
}

/* =========================
   SIMPLE INVITE SYSTEM
========================= */
function Invite({ boardId }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("")

  const inviteUser = async () => {
    if (!email || !boardId) return

    const boardRef = doc(db, "boards", boardId)

    await updateDoc(boardRef, {
      members: [...new Set([auth.currentUser.email, email])],
    })

    setStatus("User added to board")
    setEmail("")
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Invite collaborator</h3>

      <input
        placeholder="User email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={inviteUser}>Invite</button>

      {status && <p>{status}</p>}
    </div>
  )
}
