import nodemailer from 'nodemailer'

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendRequestNotification(request, approver) {
    const typeNames = {
      VACATION: 'Vacaciones',
      SICK_LEAVE: 'Permiso por Enfermedad',
      PERSONAL: 'Permiso Personal',
      SPECIAL_HOURS: 'Horas Especiales',
      MATERNITY_LEAVE: 'Licencia por Maternidad',
      PATERNITY_LEAVE: 'Licencia por Paternidad'
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: approver.email,
      subject: `Nueva solicitud de ${typeNames[request.type]} - ${request.user.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-top: 0;">Nueva Solicitud Pendiente</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">Detalles de la Solicitud</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Empleado:</td>
                  <td style="padding: 8px 0;">${request.user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Departamento:</td>
                  <td style="padding: 8px 0;">${request.user.department || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Tipo:</td>
                  <td style="padding: 8px 0;">${typeNames[request.type]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Período:</td>
                  <td style="padding: 8px 0;">${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Días:</td>
                  <td style="padding: 8px 0;">${request.days}</td>
                </tr>
                ${request.reason ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Motivo:</td>
                  <td style="padding: 8px 0;">${request.reason}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/approvals" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver y Aprobar Solicitud
              </a>
            </div>

            <p style="color: #6c757d; font-size: 14px; text-align: center;">
              Este es un mensaje automático del sistema de gestión de vacaciones.
            </p>
          </div>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log('Notification email sent successfully')
    } catch (error) {
      console.error('Error sending notification email:', error)
    }
  }

  async sendStatusNotification(request, employee) {
    const typeNames = {
      VACATION: 'Vacaciones',
      SICK_LEAVE: 'Permiso por Enfermedad',
      PERSONAL: 'Permiso Personal',
      SPECIAL_HOURS: 'Horas Especiales',
      MATERNITY_LEAVE: 'Licencia por Maternidad',
      PATERNITY_LEAVE: 'Licencia por Paternidad'
    }

    const statusNames = {
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada'
    }

    const statusColors = {
      APPROVED: '#28a745',
      REJECTED: '#dc3545'
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: employee.email,
      subject: `Solicitud ${statusNames[request.status]} - ${typeNames[request.type]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: ${statusColors[request.status]}; margin-top: 0;">
              Solicitud ${statusNames[request.status]}
            </h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">Detalles de la Solicitud</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Tipo:</td>
                  <td style="padding: 8px 0;">${typeNames[request.type]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Período:</td>
                  <td style="padding: 8px 0;">${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Días:</td>
                  <td style="padding: 8px 0;">${request.days}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Estado:</td>
                  <td style="padding: 8px 0; color: ${statusColors[request.status]}; font-weight: bold;">${statusNames[request.status]}</td>
                </tr>
                ${request.comments ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Comentarios:</td>
                  <td style="padding: 8px 0;">${request.comments}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/requests" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver Mis Solicitudes
              </a>
            </div>

            <p style="color: #6c757d; font-size: 14px; text-align: center;">
              Este es un mensaje automático del sistema de gestión de vacaciones.
            </p>
          </div>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log('Status notification email sent successfully')
    } catch (error) {
      console.error('Error sending status notification email:', error)
    }
  }
}

export default EmailService
