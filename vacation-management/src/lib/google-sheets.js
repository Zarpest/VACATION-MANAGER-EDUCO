import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

export class GoogleSheetsService {
  constructor() {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}')
      
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES
      })
      
      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
    } catch (error) {
      console.error('Error initializing Google Sheets service:', error)
      throw new Error('Failed to initialize Google Sheets service')
    }
  }

  async getEmployeeData(spreadsheetId = process.env.GOOGLE_SHEETS_ID, range = 'Empleados!A2:F1000') {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      })

      const rows = response.data.values
      if (!rows || rows.length === 0) return []

      return rows.map(row => ({
        name: row[0]?.trim(),
        email: row[1]?.trim().toLowerCase(),
        department: row[2]?.trim(),
        vacationDays: parseInt(row[3]) || 22,
        managerEmail: row[4]?.trim().toLowerCase(),
        position: row[5]?.trim()
      })).filter(emp => emp.name && emp.email)
    } catch (error) {
      console.error('Error reading Google Sheets:', error)
      throw error
    }
  }

  async syncEmployees() {
    const prisma = new PrismaClient()
    
    try {
      const employeeData = await this.getEmployeeData()
      const results = {
        created: 0,
        updated: 0,
        errors: []
      }

      for (const emp of employeeData) {
        try {
          // Buscar manager por email si existe
          let managerId = null
          if (emp.managerEmail) {
            const manager = await prisma.user.findUnique({
              where: { email: emp.managerEmail }
            })
            managerId = manager?.id
          }

          // Verificar si el usuario existe
          const existingUser = await prisma.user.findUnique({
            where: { email: emp.email }
          })

          const userData = {
            name: emp.name,
            department: emp.department,
            position: emp.position,
            vacationDaysTotal: emp.vacationDays,
            managerId: managerId,
            isActive: true,
            updatedAt: new Date()
          }

          if (existingUser) {
            // Actualizar usuario existente
            await prisma.user.update({
              where: { email: emp.email },
              data: userData
            })
            results.updated++
          } else {
            // Crear nuevo usuario
            await prisma.user.create({
              data: {
                email: emp.email,
                role: managerId ? 'EMPLOYEE' : 'MANAGER',
                ...userData
              }
            })
            results.created++
          }
        } catch (error) {
          results.errors.push({
            employee: emp.name,
            error: error.message
          })
        }
      }

      return results
    } catch (error) {
      console.error('Sync employees error:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }
}

export default GoogleSheetsService
