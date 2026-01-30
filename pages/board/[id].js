import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { onAuthStateChanged } from "firebase/auth"
import {
  doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, getDoc, setDoc
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
  const [messages, setMessages] = useState([])
  const [chatText, setChatText] = useState("")

  // Auth
  useEffect(() => onAuthStateChanged(auth, u => { if(!u) router.push("/login"); else setUser(u) }), [])

  // Board data
  useEffect(() => {
    if (!id) return
    return onSnapshot(doc(db, "boards", id), snap => {
      if(!snap.exists()) return router.push("/dashboard")
      setBoard({ id: snap.id, ...snap.data() })
    })
  }, [id])

  // Columns
  useEffect(() => {
    if (!id) return
    return onSnapshot(collection(db, "boards", id, "columns"), snap => setColumns(snap.docs.map(d=>({id:d.id,...d.data()}))))
  }, [id])

  // Activity
  useEffect(() => {
    if (!id) return
    const q = query(collection(db, "boards", id, "activity"), orderBy("createdAt","desc"))
    return onSnapshot(q, snap => setActivity(snap.docs.map(d=>d.data())))
  }, [id])

  // Chat messages
  useEffect(() => {
    if (!id) return
    const q = query(collection(db, "boards", id, "messages"), orderBy("createdAt"))
    return onSnapshot(q, snap => setMessages(snap.docs.map(d=>d.data())))
  }, [id])

  const log = async text => { await addDoc(collection(db,"boards",id,"activity"),{ text, createdAt: serverTimestamp() }) }

  const addColumn = async () => {
    if(!newColumn.trim()) return
    await addDoc(collection(db,"boards",id,"columns"),{title:newColumn,createdAt:serverTimestamp()})
    await log(`${user.email} added a column`)
    setNewColumn("")
  }

  const addTask = async columnId => {
    const text = prompt("Task title")
    if(!text) return
    await addDoc(collection(db,"boards",id,"columns",columnId,"tasks"),{text,order:Date.now(),columnId})
    await log(`${user.email} added a task`)
  }

  const invite = async () => {
    if(!inviteEmail) return alert("Enter email")
    let uid
    const snap = await getDoc(doc(db,"users",inviteEmail))
    if(!snap.exists()){ 
      uid = inviteEmail
      await setDoc(doc(db,"users",inviteEmail),{ uid, email:inviteEmail, name:inviteEmail.split("@")[0], createdAt:serverTimestamp() })
    } else uid = snap.data().uid
    await updateDoc(doc(db,"boards",id),{ members:[...new Set([...board.members, uid])]})
    await log(`${inviteEmail} joined the board`)
    setInviteEmail("")
  }

  const rename = async () => {
    const name=prompt("New board name",board.title)
    if(!name) return
    await updateDoc(doc(db,"boards",id),{title:name})
    await log(`${user.email} renamed the board`)
  }

  const remove = async () => {
    if(!confirm("Delete this board?")) return
    await deleteDoc(doc(db,"boards",id))
    router.push("/dashboard")
  }

  const sendChat = async () => {
    if(!chatText.trim()) return
    await addDoc(collection(db,"boards",id,"messages"),{ text:chatText, uid:user.uid, email:user.email, createdAt:serverTimestamp() })
    setChatText("")
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2>{board?.title}</h2>
        <div style={styles.headerButtons}>
          <button style={styles.renameBtn} onClick={rename}>Rename</button>
          <button style={styles.deleteBtn} onClick={remove}>Delete</button>
        </div>
      </header>

      <div style={styles.invite}>
        <input
          placeholder="Invite by email"
          value={inviteEmail}
          onChange={e=>setInviteEmail(e.target.value)}
          style={styles.input}
        />
        <button style={styles.primaryBtn} onClick={invite}>Invite</button>
      </div>

      <div style={styles.columns}>
        {columns.map(col=>(
          <div key={col.id} style={styles.column}>
            <h4>{col.title}</h4>
            <TaskList boardId={id} columnId={col.id} />
            <button style={styles.addTaskBtn} onClick={()=>addTask(col.id)}>+ Task</button>
          </div>
        ))}
        <div style={styles.column}>
          <input
            placeholder="New column"
            value={newColumn}
            onChange={e=>setNewColumn(e.target.value)}
            style={styles.input}
          />
          <button style={styles.primaryBtn} onClick={addColumn}>Add</button>
        </div>
      </div>

      <div style={styles.activity}>
        <h4>Activity</h4>
        {activity.map((a,i)=><p key={i}>• {a.text}</p>)}
      </div>

      <div style={styles.chat}>
        <h4>Chat</h4>
        <div style={styles.messages}>
          {messages.map((m,i)=>(
            <div key={i} style={{
              alignSelf:m.uid===user.uid?"flex-end":"flex-start",
              background:m.uid===user.uid?"#2563eb":"#eee",
              color:m.uid===user.uid?"#fff":"#000",
              padding:6,
              borderRadius:6
            }}>
              <small>{m.email}</small>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={styles.chatInput}>
          <input
            value={chatText}
            onChange={e=>setChatText(e.target.value)}
            placeholder="Type a message..."
            style={styles.input}
          />
          <button style={styles.primaryBtn} onClick={sendChat}>Send</button>
        </div>
      </div>
    </div>
  )
}

function TaskList({boardId,columnId}){
  const [tasks,setTasks]=useState([])

  useEffect(()=>onSnapshot(collection(db,"boards",boardId,"columns",columnId,"tasks"),snap=>{
    setTasks(snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.order-b.order))
  }),[boardId,columnId])

  const onDragStart=(e,task)=>e.dataTransfer.setData("task",JSON.stringify(task))
  const onDrop=async e=>{
    const task=JSON.parse(e.dataTransfer.getData("task"))
    if(task.columnId===columnId) return
    await deleteDoc(doc(db,"boards",boardId,"columns",task.columnId,"tasks",task.id))
    await addDoc(collection(db,"boards",boardId,"columns",columnId,"tasks"),{...task,columnId})
  }

  return <div onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
    {tasks.map(t=><div key={t.id} draggable onDragStart={e=>onDragStart(e,t)} style={styles.task}>{t.text}</div>)}
  </div>
}

const styles = {
  page: { padding: 20, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background:"#f5f5f5" },
  header: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  headerButtons: { display:"flex", gap:8 },
  renameBtn: { padding:"6px 12px", borderRadius:6, border:"none", background:"#fbbf24", cursor:"pointer" },
  deleteBtn: { padding:"6px 12px", borderRadius:6, border:"none", background:"#ef4444", color:"#fff", cursor:"pointer" },
  invite: { display:"flex", gap:8, marginBottom:20 },
  input: { padding:"8px 12px", borderRadius:6, border:"1px solid #ccc", flex:1, fontSize:16 },
  primaryBtn: { padding:"8px 12px", borderRadius:6, border:"none", background:"#2563eb", color:"#fff", cursor:"pointer" },
  columns: { display:"flex", gap:12, overflowX:"auto", marginBottom:20 },
  column: { background:"#fff", padding:12, width:250, borderRadius:8, flexShrink:0, boxShadow:"0 4px 10px rgba(0,0,0,0.05)" },
  addTaskBtn: { marginTop:6, padding:"6px", borderRadius:6, border:"none", background:"#2563eb", color:"#fff", cursor:"pointer" },
  task: { background:"#e3f2fd", padding:8, borderRadius:6, marginBottom:6, cursor:"grab" },
  activity: { marginBottom:20, background:"#fff", padding:12, borderRadius:8, boxShadow:"0 4px 10px rgba(0,0,0,0.05)" },
  chat: { background:"#fff", padding:12, borderRadius:8, display:"flex", flexDirection:"column", gap:5, boxShadow:"0 4px 10px rgba(0,0,0,0.05)" },
  messages: { maxHeight:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 },
  chatInput: { display:"flex", gap:6, marginTop:6 }
}
