'use client'
import { useState, useEffect } from 'react'
import { Home, Clock, DollarSign, ShoppingBag, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface DashboardData {
  todayRevenue: number
  todayOrders: number
  monthlyRevenue: number
  monthlyOrders: number
  recentOrders: Array<{
    id: string
    items: Array<{
      name: string
      price: number
    }>
    total: number
    timestamp: string
    status: string
  }>
  dailySales: Array<{
    day: string
    amount: number
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      console.error('Dashboard API Error:', err)
      setError('Gagal memuat data dashboard')
      // Mock data for demonstration with Indonesian content
      setData({
        todayRevenue: 250000,
        todayOrders: 100,
        monthlyRevenue: 7500000,
        monthlyOrders: 2850,
        recentOrders: [
          {
            id: '#001',
            items: [
              { name: 'Nasi Goreng', price: 15000 },
              { name: 'Es Teh Manis', price: 3000 },
              { name: 'Kerupuk', price: 2000 }
            ],
            total: 20000,
            timestamp: new Date().toISOString(),
            status: 'selesai'
          },
          {
            id: '#002',
            items: [
              { name: 'Bakso', price: 20000 },
              { name: 'Air Putih', price: 2000 },
              { name: 'Kerupuk', price: 2000 }
            ],
            total: 24000,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'diproses'
          },
          {
            id: '#003',
            items: [
              { name: 'Gado-gado', price: 12000 },
              { name: 'Es Jeruk', price: 5000 }
            ],
            total: 17000,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'selesai'
          }
        ],
        dailySales: [
          { day: '1', amount: 180000 },
          { day: '2', amount: 220000 },
          { day: '3', amount: 350000 },
          { day: '4', amount: 180000 },
          { day: '5', amount: 280000 },
          { day: '6', amount: 190000 },
          { day: '7', amount: 160000 },
          { day: '8', amount: 240000 },
          { day: '9', amount: 320000 },
          { day: '10', amount: 200000 },
          { day: '11', amount: 280000 },
          { day: '12', amount: 340000 },
          { day: '13', amount: 220000 },
          { day: '14', amount: 160000 },
          { day: '15', amount: 380000 },
          { day: '16', amount: 290000 },
          { day: '17', amount: 210000 },
          { day: '18', amount: 250000 },
          { day: '19', amount: 190000 },
          { day: '20', amount: 420000 },
          { day: '21', amount: 250000 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selesai':
        return 'bg-green-100 text-green-800'
      case 'diproses':
        return 'bg-yellow-100 text-yellow-800'
      case 'dibatalkan':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-20 lg:pb-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Dashboard</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Total penjualan hari ini</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {formatCurrency(data?.todayRevenue || 0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Total transaksi hari ini</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{data?.todayOrders || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Total penjualan bulanan</p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {formatCurrency(data?.monthlyRevenue || 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium">Total transaksi bulanan</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{data?.monthlyOrders || 0}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Transaksi Terkini</h2>
            
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-blue-600">{formatDate(order.timestamp)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">OrderID {order.id}</span>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-700">• {item.name}</span>
                              <span className="text-gray-600">{formatCurrency(item.price)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(order.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Belum ada transaksi terkini</p>
              </div>
            )}
          </div>

          {/* Daily Sales Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Penjualan Harian</h2>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            {data?.dailySales && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailySales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Penjualan']}
                      labelFormatter={(label) => `Hari ke-${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      fillOpacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Vol trx</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden">
          <div className="flex justify-around items-center py-2">
            <button className="flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700">
              <Home className="w-6 h-6 mb-1 transition-all duration-200 text-gray-500" />
              <span className="text-xs transition-all duration-200 text-gray-500">Home</span>
            </button>
            
            <button className="flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700">
              <ShoppingBag className="w-6 h-6 mb-1 transition-all duration-200 text-gray-500" />
              <span className="text-xs transition-all duration-200 text-gray-500">Order</span>
            </button>
            
            <button className="flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 text-blue-600 font-bold bg-blue-50 shadow-md transform scale-105 relative">
              <BarChart3 className="w-6 h-6 mb-1 transition-all duration-200 text-blue-600 drop-shadow-lg" />
              <span className="text-xs transition-all duration-200 text-blue-600 font-bold">Dashboard</span>
              <div className="absolute -top-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            </button>
            
            <button className="flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700">
              <Clock className="w-6 h-6 mb-1 transition-all duration-200 text-gray-500" />
              <span className="text-xs transition-all duration-200 text-gray-500">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}