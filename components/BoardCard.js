import Link from "next/link"

export default function BoardCard({ board }) {
  return (
    <Link href={`/board/${board.id}`}>
      <div style={{
        background: "#fff",
        padding: 20,
        marginBottom: 10,
        borderRadius: 6
      }}>
        {board.name}
      </div>
    </Link>
  )
}
