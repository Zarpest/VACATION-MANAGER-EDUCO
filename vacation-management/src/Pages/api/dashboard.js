import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    // Calcular días y horas restantes
    const vacationDaysRemaining = user.vacationDaysTotal - user.vacationDaysUsed
    const specialHoursRemaining = user.specialHoursTotal - user.specialHoursUsed

    // Contar solicitudes pendientes del usuario
    const pendingRequests = await prisma.request.count({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      }
    })

    // Contar aprobaciones pendientes (si es manager o superior)
    let pendingApprovals = 0
    if (['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      const whereClause = session.user.role === 'HR' || session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
        ? { status: 'PENDING' }
        : { 
            status: 'PENDING',
            user: { managerId: session.user.id }
          }

      pendingApprovals = await prisma.request.count({ where: whereClause })
    }

    const dashboardData = {
      vacationDaysTotal: user.vacationDaysTotal,
      vacationDaysUsed: user.vacationDaysUsed,
      vacationDaysRemaining,
      specialHoursTotal: user.specialHoursTotal,
      specialHoursUsed: user.specialHoursUsed,
      specialHoursRemaining,
      pendingRequests,
      pendingApprovals,
      recentRequests: user.requests
    }

    res.status(200).json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
