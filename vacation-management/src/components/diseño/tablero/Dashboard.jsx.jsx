import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState(null)
  const [officePresence, setOfficePresence] = useState(0)

  useEffect(() => {
    fetchDashboardData()
    fetchOfficePresence()
  }, [])

  const fetchDashboardData = async () => {
    const response = await fetch('/api/dashboard')
    const data = await response.json()
    setDashboardData(data)
  }

  const fetchOfficePresence = async () => {
    const response = await fetch('/api/presence/count')
    const data = await response.json()
    setOfficePresence(data.count)
  }

  if (!dashboardData) return <div>Cargando...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {session?.user?.name}
        </h1>
        <p className="text-gray-600">
          Panel de control - {getRoleDisplayName(session?.user?.role)}
        </p>
      </div>

      {/* Contador de presencia en oficina */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Personas en Oficina
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {officePresence}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de resumen personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Días de Vacaciones"
          value={`${dashboardData.vacationDaysRemaining}/${dashboardData.vacationDaysTotal}`}
          icon={<Calendar className="h-6 w-6" />}
          color="green"
        />
        <DashboardCard
          title="Horas Especiales"
          value={`${dashboardData.specialHoursRemaining}/${dashboardData.specialHoursTotal}`}
          icon={<Clock className="h-6 w-6" />}
          color="blue"
        />
        <DashboardCard
          title="Solicitudes Pendientes"
          value={dashboardData.pendingRequests}
          icon={<CheckCircle className="h-6 w-6" />}
          color="yellow"
        />
        {session?.user?.role !== 'EMPLOYEE' && (
          <DashboardCard
            title="Aprobaciones Pendientes"
            value={dashboardData.pendingApprovals}
            icon={<Users className="h-6 w-6" />}
            color="red"
          />
        )}
      </div>

      {/* Solicitudes recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Solicitudes Recientes
          </h2>
        </div>
        <div className="p-6">
          <RecentRequests requests={dashboardData.recentRequests} />
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ title, value, icon, color }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

function RecentRequests({ requests }) {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{request.type}</p>
            <p className="text-sm text-gray-600">
              {new Date(request.startDate).toLocaleDateString()} - 
              {new Date(request.endDate).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {getStatusText(request.status)}
          </span>
        </div>
      ))}
    </div>
  )
}

function getRoleDisplayName(role) {
  const roles = {
    SUPER_ADMIN: 'Superadministrador',
    ADMIN: 'Administrador',
    HR: 'Recursos Humanos',
    MANAGER: 'Jefe/Aprobador',
    EMPLOYEE: 'Empleado'
  }
  return roles[role] || role
}

function getStatusColor(status) {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getStatusText(status) {
  const texts = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado'
  }
  return texts[status] || status
}
