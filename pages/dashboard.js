import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import { theme } from "../lib/theme"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [boards, setBoards] = useState([])
  const [title, setTitle] = useState("")
  const [showNewBoard, setShowNewBoard] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      if (!u) router.push("/login")
      else setUser(u)
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, "boards"), where("members", "array-contains", user.uid))
    return onSnapshot(q, snap => {
      setBoards(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [user])

  const createBoard = async () => {
    if (!title.trim()) return alert("Enter title")
    await addDoc(collection(db, "boards"), {
      title,
      owner: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp()
    })
    setTitle("")
    setShowNewBoard(false)
  }

  return (
    <div style={{ minHeight: "100vh", padding: 40, background: theme.pageBg, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: theme.textPrimary }}>Your Boards</h2>
        <button style={{ padding:"8px 16px", borderRadius:6, border:"none", background: theme.danger, color:"#fff", cursor:"pointer", fontWeight:500 }}>Logout</button>
      </div>

      {showNewBoard ? (
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Board name" style={{ flex:1, padding:"8px 12px", borderRadius:6, border:`1px solid ${theme.inputBorder}`, fontSize:16 }} />
          <button onClick={createBoard} style={{ padding:"8px 16px", borderRadius:6, border:"none", background: theme.primary, color:"#fff", cursor:"pointer", fontWeight:500 }}>Create</button>
        </div>
      ) : (
        <button onClick={() => setShowNewBoard(true)} style={{ padding:"10px 20px", borderRadius:6, border:"none", background: theme.primary, color:"#fff", fontWeight:500, cursor:"pointer", marginBottom:20 }}>+ New Board</button>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:20 }}>
        {boards.map(b => (
          <div key={b.id} style={{ background: theme.cardBg, padding:20, borderRadius:8, cursor:"pointer", fontWeight:500, fontSize:16, boxShadow: theme.shadow }} onClick={() => router.push(`/board/${b.id}`)}>
            {b.title}
          </div>
        ))}
      </div>

      <button onClick={() => signOut(auth)} style={{ marginTop: 20, padding:"8px 16px", borderRadius:6, border:"none", background: theme.danger, color:"#fff", cursor:"pointer", fontWeight:500 }}>Logout</button>
    </div>
  )
}
