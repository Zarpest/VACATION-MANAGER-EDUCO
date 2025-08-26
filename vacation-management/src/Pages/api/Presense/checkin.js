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

    // Verificar si ya hay un check-in para hoy
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today
        }
      }
    })

    if (existingCheckIn && !existingCheckIn.checkOut) {
      return res.status(400).json({ 
        message: 'Ya tienes un check-in activo para hoy' 
      })
    }

    // Crear nuevo check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: session.user.id,
        checkIn: new Date(),
        date: today
      }
    })

    res.status(201).json(checkIn)
  } catch (error) {
    console.error('Check-in error:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}
