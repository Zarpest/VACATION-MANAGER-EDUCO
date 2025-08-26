import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    return handleGet(req, res, session)
  } else if (req.method === 'POST') {
    return handlePost(req, res, session)
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}

async function handleGet(req, res, session) {
  try {
    const { userId, status, type } = req.query
    
    let whereClause = {}
    
    // Filtros basados en rol
    if (session.user.role === 'EMPLOYEE') {
      whereClause.userId = session.user.id
    } else if (session.user.role === 'MANAGER') {
      whereClause = userId ? { userId } : {
        user: { managerId: session.user.id }
      }
    }
    // HR, ADMIN y SUPER_ADMIN pueden ver todas las solicitudes
    
    if (status) whereClause.status = status
    if (type) whereClause.type = type

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true, department: true }
        },
        approver: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.status(200).json(requests)
  } catch (error) {
    console.error('Get requests error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

async function handlePost(req, res, session) {
  try {
    const { type, startDate, endDate, reason } = req.body

    // Validaciones básicas
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ message: 'Campos requeridos faltantes' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = calculateBusinessDays(start, end)

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // Validar disponibilidad
    if (type === 'VACATION') {
      const availableDays = user.vacationDaysTotal - user.vacationDaysUsed
      if (days > availableDays) {
        return res.status(400).json({ 
          message: `No tienes suficientes días de vacaciones. Disponibles: ${availableDays}` 
        })
      }
    }

    // Crear la solicitud
    const request = await prisma.request.create({
      data: {
        userId: session.user.id,
        type,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    // Enviar notificación al aprobador
    await sendApprovalNotification(request)

    res.status(201).json(request)
  } catch (error) {
    console.error('Create request error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

function calculateBusinessDays(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No es domingo ni sábado
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

async function sendApprovalNotification(request) {
  // Implementar envío de email o notificación
  console.log(`Nueva solicitud de ${request.user.name} requiere aprobación`)
}
