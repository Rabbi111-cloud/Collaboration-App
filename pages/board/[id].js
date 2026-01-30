import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc
} from "firebase/firestore"
import { auth, db } from "../../lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function BoardPage() {
  const router = useRouter()
  const { id } = router.query

  const [user, setUser] = useState(null)
  const [columns, setColumns] = useState([])
  const [newColumn, setNewColumn] = useState("")
  const [dragTask, setDragTask] = useState(null)

  // 🔐 Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) router.push("/login")
      else setUser(u)
    })
    return () => unsub()
  }, [])

  // 📡 Load columns
  useEffect(() => {
    if (!id) return

    const q = query(
      collection(db, "boards", id, "columns"),
      orderBy("order")
    )

    const unsub = onSnapshot(q, snap => {
      const cols = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        tasks: []
      }))
      setColumns(cols)
    })

    return () => unsub()
  }, [id])

  // 📡 Load tasks per column
  useEffect(() => {
    if (!id || columns.length === 0) return

    const unsubs = columns.map(col =>
      onSnapshot(
        query(
          collection(db, "boards", id, "columns", col.id, "tasks"),
          orderBy("order")
        ),
        snap => {
          setColumns(prev =>
            prev.map(c =>
              c.id === col.id
                ? { ...c, tasks: snap.docs.map(t => ({ id: t.id, ...t.data() })) }
                : c
            )
          )
        }
      )
    )

    return () => unsubs.forEach(u => u())
  }, [id, columns.length])

  // ➕ Add column
  const addColumn = async () => {
    if (!newColumn.trim()) return

    await addDoc(collection(db, "boards", id, "columns"), {
      title: newColumn,
      order: columns.length
    })

    setNewColumn("")
  }

  // ➕ Add task
  const addTask = async (columnId) => {
    const title = prompt("Task title")
    if (!title) return

    await addDoc(
      collection(db, "boards", id, "columns", columnId, "tasks"),
      {
        title,
        order: Date.now()
      }
    )
  }

  // 🧲 Drag logic (SAFE)
  const onDrop = async (columnId) => {
    if (!dragTask) return

    await updateDoc(
      doc(db, "boards", id, "columns", dragTask.columnId, "tasks", dragTask.id),
      { columnId }
    )

    setDragTask(null)
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => router.push("/dashboard")}>⬅ Back</button>
        <h2>Board</h2>
      </div>

      <div style={styles.columns}>
        {columns.map(col => (
          <div
            key={col.id}
            style={styles.column}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(col.id)}
          >
            <h4>{col.title}</h4>

            {col.tasks.map(task => (
              <div
                key={task.id}
                style={styles.task}
                draggable
                onDragStart={() =>
                  setDragTask({ ...task, columnId: col.id })
                }
              >
                {task.title}
              </div>
            ))}

            <button style={styles.addTask} onClick={() => addTask(col.id)}>
              + Add Task
            </button>
          </div>
        ))}

        {/* Add column */}
        <div style={styles.addColumn}>
          <input
            placeholder="New column"
            value={newColumn}
            onChange={e => setNewColumn(e.target.value)}
          />
          <button onClick={addColumn}>Add</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: "15px",
    minHeight: "100vh",
    background: "#eceff1"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px"
  },
  columns: {
    display: "flex",
    gap: "15px",
    overflowX: "auto"
  },
  column: {
    minWidth: "250px",
    background: "#fff",
    padding: "10px",
    borderRadius: "10px"
  },
  task: {
    background: "#e3f2fd",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "6px",
    cursor: "grab"
  },
  addTask: {
    marginTop: "5px",
    background: "transparent",
    border: "none",
    color: "#0070f3",
    cursor: "pointer"
  },
  addColumn: {
    minWidth: "200px",
    background: "#fff",
    padding: "10px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  }
}
