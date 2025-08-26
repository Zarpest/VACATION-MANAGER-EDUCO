import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
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

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Buscar check-in activo para hoy
    const activeCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today
        },
        checkOut: null
      }
    })

    if (!activeCheckIn) {
      return res.status(400).json({ 
        message: 'No tienes un check-in activo para hacer check-out' 
      })
    }

    // Actualizar con check-out
    const updatedCheckIn = await prisma.checkIn.update({
      where: { id: activeCheckIn.id },
      data: {
        checkOut: new Date()
      }
    })

    res.status(200).json(updatedCheckIn)
  } catch (error) {
    console.error('Check-out error:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
