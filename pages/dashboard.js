import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)

  const [showNewBoard, setShowNewBoard] = useState(false)
  const [title, setTitle] = useState("")

  // 🔐 Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login")
      } else {
        setUser(u)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  // 📡 Realtime boards
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "boards"),
      where("owner", "==", user.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setBoards(data)
    })

    return () => unsub()
  }, [user])

  // ➕ Create board
  const createBoard = async () => {
    if (!title.trim()) return alert("Enter board title")

    await addDoc(collection(db, "boards"), {
      title,
      owner: user.uid,
      createdAt: serverTimestamp()
    })

    setTitle("")
    setShowNewBoard(false)
  }

  const logout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2>Your Boards</h2>
        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

      {/* New board */}
      {showNewBoard ? (
        <div style={styles.newBoard}>
          <input
            placeholder="Board title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={createBoard}>Create</button>
            <button onClick={() => setShowNewBoard(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          style={styles.addBoard}
          onClick={() => setShowNewBoard(true)}
        >
          + New Board
        </button>
      )}

      {/* Boards */}
      <div style={styles.grid}>
        {boards.map(board => (
          <div
            key={board.id}
            style={styles.board}
            onClick={() => router.push(`/board/${board.id}`)}
          >
            {board.title}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: "20px",
    minHeight: "100vh",
    background: "#f1f3f4"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  logout: {
    background: "#e63946",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px"
  },
  addBoard: {
    padding: "12px",
    background: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  newBoard: {
    background: "#fff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "15px"
  },
  board: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "transform .1s",
  },
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}
