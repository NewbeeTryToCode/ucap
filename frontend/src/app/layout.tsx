import './globals.css'
import BottomNav from './components/BottomNav'

export const metadata = {
  title: 'Mobile App',
  description: 'Voice Ordering App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <main className="pb-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
