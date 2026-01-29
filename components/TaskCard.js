export default function TaskCard({ task }) {
  return (
    <div style={{
      background: "#fff",
      padding: 10,
      marginBottom: 8,
      borderRadius: 4
    }}>
      {task.title}
    </div>
  )
}
