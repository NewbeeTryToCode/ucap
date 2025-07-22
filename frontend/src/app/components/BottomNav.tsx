'use client'

import { Home, ShoppingCart, BarChart3, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { id: 'home', icon: Home, label: 'Home', href: '/' },
  { id: 'order', icon: ShoppingCart, label: 'Order', href: '/order' },
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
  { id: 'profile', icon: User, label: 'Profile', href: '/profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 font-bold bg-blue-50 shadow-md transform scale-105'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`text-xs ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
