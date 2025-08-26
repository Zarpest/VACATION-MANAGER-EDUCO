import { useState, useEffect } from 'react'
import { MapPin, Clock } from 'lucide-react'

export default function PresenceWidget() {
  const [status, setStatus] = useState(null) // 'in' | 'out' | null
  const [checkInTime, setCheckInTime] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkCurrentStatus()
  }, [])

  const checkCurrentStatus = async () => {
    try {
      const response = await fetch('/api/presence/status')
      const data = await response.json()
      
      if (data.checkIn) {
        setStatus(data.checkOut ? 'out' : 'in')
        setCheckInTime(new Date(data.checkIn))
      } else {
        setStatus('out')
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/presence/checkin', {
        method: 'POST'
      })
      
      if (response.ok) {
        setStatus('in')
        setCheckInTime(new Date())
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Check-in error:', error)
      alert('Error al hacer check-in')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/presence/checkout', {
        method: 'POST'
      })
      
      if (response.ok) {
        setStatus('out')
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Check-out error:', error)
      alert('Error al hacer check-out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Estado de Presencia
        </h3>
        <MapPin className={`h-5 w-5 ${
          status === 'in' ? 'text-green-500' : 'text-gray-400'
        }`} />
      </div>

      <div className="space-y-4">
        {status === 'in' && checkInTime && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Entrada: {checkInTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        <div className="flex space-x-3">
          {status === 'out' ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Check-in'}
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Check-out'}
            </button>
          )}
        </div>

        <div className={`text-center text-sm font-medium ${
          status === 'in' ? 'text-green-600' : 'text-gray-500'
        }`}>
          {status === 'in' ? '🟢 En oficina' : '🔴 Fuera de oficina'}
        </div>
      </div>
    </div>
  )
}
