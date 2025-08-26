import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Calendar, User, MessageSquare } from 'lucide-react'

export default function ApprovalsPanel() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [comments, setComments] = useState('')

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/requests?status=PENDING')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (requestId, action) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          comments
        })
      })

      if (response.ok) {
        // Actualizar la lista
        setRequests(requests.filter(req => req.id !== requestId))
        setSelectedRequest(null)
        setComments('')
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      alert('Error al procesar la solicitud')
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando solicitudes...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Aprobaciones</h1>
        <p className="text-gray-600">
          {requests.length} solicitud{requests.length !== 1 ? 'es' : ''} pendiente{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ¡Todo al día!
          </h3>
          <p className="text-gray-600">
            No hay solicitudes pendientes de aprobación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de solicitudes */}
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                isSelected={selectedRequest?.id === request.id}
                onClick={() => setSelectedRequest(request)}
              />
            ))}
          </div>

          {/* Panel de detalles y aprobación */}
          {selectedRequest && (
            <div className="bg-white rounded-lg shadow-md p-6 h-fit">
              <RequestDetails
                request={selectedRequest}
                comments={comments}
                onCommentsChange={setComments}
                onApprove={() => handleApproval(selectedRequest.id, 'APPROVED')}
                onReject={() => handleApproval(selectedRequest.id, 'REJECTED')}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RequestCard({ request, isSelected, onClick }) {
  const typeColors = {
    VACATION: 'bg-blue-100 text-blue-800',
    SICK_LEAVE: 'bg-red-100 text-red-800',
    PERSONAL: 'bg-green-100 text-green-800',
    SPECIAL_HOURS: 'bg-purple-100 text-purple-800'
  }

  const typeNames = {
    VACATION: 'Vacaciones',
    SICK_LEAVE: 'Enfermedad',
    PERSONAL: 'Personal',
    SPECIAL_HOURS: 'Horas Especiales'
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900">{request.user.name}</h3>
            <p className="text-sm text-gray-600">{request.user.department}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[request.type]}`}>
          {typeNames[request.type]}
        </span>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(request.startDate).toLocaleDateString()}
        </div>
        <span>-</span>
        <div>
          {new Date(request.endDate).toLocaleDateString()}
        </div>
        <span className="text-gray-400">•</span>
        <span className="font-medium">{request.days} día{request.days !== 1 ? 's' : ''}</span>
      </div>

      {request.reason && (
        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
          {request.reason}
        </p>
      )}
    </div>
  )
}

function RequestDetails({ request, comments, onCommentsChange, onApprove, onReject }) {
  const typeNames = {
    VACATION: 'Vacaciones',
    SICK_LEAVE: 'Permiso por Enfermedad',
    PERSONAL: 'Permiso Personal',
    SPECIAL_HOURS: 'Horas Especiales'
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Detalles de la Solicitud
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="font-medium text-gray-700">Empleado:</span>
            <span className="ml-2">{request.user.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Departamento:</span>
            <span className="ml-2">{request.user.department}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Tipo:</span>
            <span className="ml-2">{typeNames[request.type]}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Período:</span>
            <span className="ml-2">
              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Días solicitados:</span>
            <span className="ml-2">{request.days}</span>
          </div>
          {request.reason && (
            <div>
              <span className="font-medium text-gray-700">Motivo:</span>
              <p className="mt-1 text-gray-600">{request.reason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Comentarios */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="inline h-4 w-4 mr-1" />
          Comentarios (Opcional)
        </label>
        <textarea
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Agregar comentarios sobre la decisión..."
        />
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4">
        <button
          onClick={onReject}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Rechazar
        </button>
        <button
          onClick={onApprove}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Aprobar
        </button>
      </div>
    </div>
  )
}
