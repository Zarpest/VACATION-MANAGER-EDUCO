      days.push({ date, isCurrentMonth: true })
    }
    
    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    
    return days
  }

  const getRequestsForDate = (date) => {
    return requests.filter(request => {
      const startDate = new Date(request.startDate)
      const endDate = new Date(request.endDate)
      return date >= startDate && date <= endDate
    })
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const days = getDaysInMonth(currentDate)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header del calendario */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Calendario del Equipo
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Grilla del calendario */}
        <div className="p-6">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayRequests = getRequestsForDate(day.date)
              const isToday = day.date.toDateString() === new Date().toDateString()
              
              return (
                <CalendarDay
                  key={index}
                  date={day.date}
                  isCurrentMonth={day.isCurrentMonth}
                  isToday={isToday}
                  requests={dayRequests}
                />
              )
            })}
          </div>
        </div>

        {/* Leyenda */}
        <div className="px-6 pb-6">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Vacaciones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Enfermedad</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Personal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Horas Especiales</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarDay({ date, isCurrentMonth, isToday, requests }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const typeColors = {
    VACATION: 'bg-blue-500',
    SICK_LEAVE: 'bg-red-500',
    PERSONAL: 'bg-green-500',
    SPECIAL_HOURS: 'bg-purple-500'
  }

  const typeNames = {
    VACATION: 'Vacaciones',
    SICK_LEAVE: 'Enfermedad',
    PERSONAL: 'Personal',
    SPECIAL_HOURS: 'Horas Especiales'
  }

  return (
    <div
      className={`relative min-h-[80px] p-1 border border-gray-200 ${
        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`text-sm ${
        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
      } ${isToday ? 'font-bold text-blue-600' : ''}`}>
        {date.getDate()}
      </div>

      {/* Indicadores de solicitudes */}
      <div className="mt-1 space-y-1">
        {requests.slice(0, 3).map((request, index) => (
          <div
            key={request.id}
            className={`h-1 rounded-full ${typeColors[request.type]}`}
          />
        ))}
        {requests.length > 3 && (
          <div className="text-xs text-gray-500">
            +{requests.length - 3} más
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && requests.length > 0 && (
        <div className="absolute z-10 top-full left-0 mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg min-w-[200px]">
          {requests.map(request => (
            <div key={request.id} className="mb-1">
              <div className="font-medium">{request.user.name}</div>
              <div className="text-gray-300">{typeNames[request.type]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
