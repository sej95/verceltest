import './globals.css'

export const metadata = {
  title: 'Next.js Vercel Demo 2025',
  description: 'Deployed on Vercel via GitHub',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="container">{children}</body>
    </html>
  )
}