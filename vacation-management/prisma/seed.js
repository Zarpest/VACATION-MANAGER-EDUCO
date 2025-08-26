const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Crear usuario super admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      email: 'admin@empresa.com',
      name: 'Super Administrador',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      department: 'IT',
      position: 'Super Admin',
      vacationDaysTotal: 30,
      isActive: true
    }
  })

  // Crear usuario HR
  const hrUser = await prisma.user.upsert({
    where: { email: 'rrhh@empresa.com' },
    update: {},
    create: {
      email: 'rrhh@empresa.com',
      name: 'Recursos Humanos',
      password: hashedPassword,
      role: 'HR',
      department: 'Recursos Humanos',
      position: 'Especialista RR.HH.',
      vacationDaysTotal: 25,
      isActive: true
    }
  })

  // Crear manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@empresa.com' },
    update: {},
    create: {
      email: 'manager@empresa.com',
      name: 'Juan Manager',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'Desarrollo',
      position: 'Jefe de Desarrollo',
      vacationDaysTotal: 25,
      isActive: true
    }
  })

  // Crear empleados
  const employee1 = await prisma.user.upsert({
    where: { email: 'empleado1@empresa.com' },
    update: {},
    create: {
      email: 'empleado1@empresa.com',
      name: 'María Empleada',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'Desarrollo',
      position: 'Desarrolladora',
      managerId: manager.id,
      vacationDaysTotal: 22,
      isActive: true
    }
  })

  const employee2 = await prisma.user.upsert({
    where: { email: 'empleado2@empresa.com' },
    update: {},
    create: {
      email: 'empleado2@empresa.com',
      name: 'Carlos Empleado',
      password: hashedPassword,
      role: 'EMPLOYEE',
      department: 'Desarrollo',
      position: 'Desarrollador',
      managerId: manager.id,
      vacationDaysTotal: 22,
      isActive: true
    }
  })

  console.log('Seed data created successfully!')
  console.log('Users created:', { superAdmin, hrUser, manager, employee1, employee2 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
