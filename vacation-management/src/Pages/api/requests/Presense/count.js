import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Verificar permisos de aprobación
  if (!['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return res.status(403).json({ message: 'No tienes permisos para aprobar solicitudes' })
  }

  try {
    const { id } = req.query
    const { action, comments } = req.body // action: 'APPROVED' | 'REJECTED'

    const request = await prisma.request.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' })
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Esta solicitud ya fue procesada' })
    }

    // Verificar si el usuario puede aprobar esta solicitud
    if (session.user.role === 'MANAGER' && request.user.managerId !== session.user.id) {
      return res.status(403).json({ message: 'No puedes aprobar solicitudes de este empleado' })
    }

    // Actualizar la solicitud
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        status: action,
        approverId: session.user.id,
        approvedAt: new Date(),
        comments
      }
    })

    // Si se aprueba, actualizar los días/horas usados del empleado
    if (action === 'APPROVED') {
      if (request.type === 'VACATION') {
        await prisma.user.update({
          where: { id: request.userId },
          data: {
            vacationDaysUsed: {
              increment: request.days
            }
          }
        })
      } else if (request.type === 'SPECIAL_HOURS') {
        await prisma.user.update({
          where: { id: request.userId },
          data: {
            specialHoursUsed: {
              increment: request.days * 8 // Asumiendo 8 horas por día
            }
          }
        })
      }
    }

    // Enviar notificación al empleado
    await sendStatusNotification(updatedRequest, request.user)

    res.status(200).json(updatedRequest)
  } catch (error) {
    console.error('Approve request error:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}

async function sendStatusNotification(request, user) {
  console.log(`Solicitud ${request.status} para ${user.name}`)
  // Implementar envío de email
}
