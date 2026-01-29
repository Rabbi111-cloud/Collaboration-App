import Link from "next/link"

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Task Collaboration App</h1>
      <p>Simple Trello / Asana-like task manager</p>
      <Link href="/login">
        <button>Get Started</button>
      </Link>
    </div>
  )
}
