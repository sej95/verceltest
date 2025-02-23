import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1>Next.js on Vercel 🚀</h1>
      <div className="card">
        <Image
          src="/vercel.svg"
          alt="Vercel Logo"
          width={300}
          height={64}
          priority
        />
        <p>Deployed from GitHub with CI/CD</p>
        <Link href="/api/status" className="button">
          Check API Status →
        </Link>
      </div>
    </main>
  )
}