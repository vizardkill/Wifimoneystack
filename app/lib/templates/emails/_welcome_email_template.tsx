import type * as React from 'react'

import { Body, Button, Container, Head, Html, Img, Preview, Section, Text } from '@react-email/components'

interface WelcomeTemplateProps {
  userName: string
  dashboardUrl: string
}

const hostPort = process.env.HOST_PORT
const portSegment = typeof hostPort === 'string' && hostPort.length > 0 ? hostPort : ''
const baseUrl = process.env.NGROK_URL || `${process.env.HOST_PROTOCOL}://${process.env.HOST_NAME}${portSegment}`

export const WelcomeTemplate = ({ userName, dashboardUrl }: WelcomeTemplateProps): React.JSX.Element => (
  <Html>
    <Head />
    <Preview>¡Bienvenido a WMC Marketplace, {userName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={`${baseUrl}/apple-icon.png`} width="150" height="50" alt="Logo" style={logo} />
        </Section>

        <Section style={content}>
          <Text style={heading}>¡Bienvenido a WMC Marketplace, {userName}!</Text>

          <Text style={paragraph}>
            Tu cuenta ha sido verificada exitosamente. Ya podés comenzar a explorar el stack de 21 aplicaciones ecommerce disponibles en el marketplace.
          </Text>

          <Section style={buttonSection}>
            <Button href={dashboardUrl} style={button}>
              Acceder al Dashboard
            </Button>
          </Section>

          <Text style={subheading}>¿Qué podés hacer ahora?</Text>

          <Section style={listSection}>
            <Text style={listItem}>• Explorar el WIFI STACK · 21 apps activas</Text>
            <Text style={listItem}>• Ver detalle e instrucciones de cada app</Text>
            <Text style={listItem}>• Instalar o acceder a las herramientas</Text>
            <Text style={listItem}>• Revisar dashboards de uso y reportes</Text>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>Si tenés alguna pregunta, no dudes en contactarnos.</Text>
          <Text style={footerText}>Equipo WMC</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default WelcomeTemplate

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif'
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '600px',
  width: '100%'
}

const header = {
  backgroundColor: '#020617',
  padding: '20px 0',
  textAlign: 'center' as const
}

const logo = {
  margin: '0 auto'
}

const content = {
  padding: '20px 30px'
}

const heading = {
  color: '#22c55e',
  fontSize: '24px',
  fontWeight: 'bold',
  lineHeight: '1.25',
  margin: '0 0 20px'
}

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '1.4',
  margin: '0 0 20px'
}

const subheading = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '30px 0 15px'
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '30px 0'
}

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '12px 0'
}

const listSection = {
  margin: '0 0 20px'
}

const listItem = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '1.4',
  margin: '5px 0'
}

const footer = {
  backgroundColor: '#f8f9fa',
  padding: '20px 30px',
  textAlign: 'center' as const
}

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '5px 0'
}
