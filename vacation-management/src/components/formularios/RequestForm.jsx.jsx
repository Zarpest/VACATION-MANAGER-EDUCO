              {...register('endDate', { required: 'Fecha de fin requerida' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Motivo (Opcional)
          </label>
          <textarea
            {...register('reason')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe el motivo de tu solicitud..."
          />
        </div>

        {/* Información adicional según el tipo */}
        {requestType && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <RequestTypeInfo type={requestType} />
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}

function RequestTypeInfo({ type }) {
  const info = {
    VACATION: {
      title: 'Vacaciones',
      description: 'Las vacaciones se descontarán de tu saldo anual. Asegúrate de coordinar con tu equipo.',
      icon: <Calendar className="h-5 w-5 text-blue-600" />
    },
    SICK_LEAVE: {
      title: 'Permiso por Enfermedad',
      description: 'Los permisos médicos pueden requerir certificado médico según la política de la empresa.',
      icon: <Clock className="h-5 w-5 text-red-600" />
    },
    PERSONAL: {
      title: 'Permiso Personal',
      description: 'Permiso para asuntos personales. Sujeto a aprobación del supervisor.',
      icon: <FileText className="h-5 w-5 text-green-600" />
    },
    SPECIAL_HOURS: {
      title: 'Horas Especiales',
      description: 'Se descontarán de tu saldo de 24 horas anuales para asuntos personales.',
      icon: <Clock className="h-5 w-5 text-purple-600" />
    }
  }

  const currentInfo = info[type]

  return (
    <div className="flex items-start space-x-3">
      {currentInfo.icon}
      <div>
        <h4 className="font-medium text-gray-900">{currentInfo.title}</h4>
        <p className="text-sm text-gray-600">{currentInfo.description}</p>
      </div>
    </div>
  )
}
