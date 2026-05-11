import type { JSX } from 'react'

import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from '@react-email/components'

interface VerifyEmailTemplateProps {
  userName: string
  validationUrl: string
}

const hostPort = process.env.HOST_PORT
const portSegment = typeof hostPort === 'string' && hostPort.length > 0 ? hostPort : ''
const baseUrl = process.env.NGROK_URL || `${process.env.HOST_PROTOCOL}://${process.env.HOST_NAME}${portSegment}`

export const VerifyEmailTemplate = ({ userName, validationUrl }: VerifyEmailTemplateProps): JSX.Element => (
  <Html>
    <Head />
    <Preview>Activa tu cuenta en WMC Marketplace</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Img src={`${baseUrl}/apple-icon.png`} width="100" height="auto" alt="Logo" />
        </Section>

        <Heading style={h1}>Confirma tu correo electrónico</Heading>

        <Text style={text}>Hola, {userName},</Text>

        <Text style={text}>
          ¡Gracias por registrarte! Solo falta un paso más. Por favor, haz clic en el botón de abajo para verificar tu dirección de correo electrónico y activar
          tu cuenta.
        </Text>

        <Section style={buttonContainer}>
          <Button style={button} href={validationUrl}>
            Activar Mi Cuenta
          </Button>
        </Section>

        <Text style={text}>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</Text>
        <Link href={validationUrl} style={link}>
          {validationUrl}
        </Link>

        <Hr style={hr} />

        <Text style={footerText}>Si no creaste una cuenta con nosotros, puedes ignorar este correo de forma segura.</Text>
        <Text style={footerText}>
          Saludos cordiales
          <br />
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif'
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 40px',
  borderRadius: '8px',
  border: '1px solid #e6ebf1',
  maxWidth: '480px'
}

const logoContainer = {
  textAlign: 'center' as const,
  padding: '0'
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0'
}

const text = {
  color: '#3c4043',
  fontSize: '16px',
  lineHeight: '24px'
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0'
}

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 24px'
}

const link = {
  color: '#067df7',
  fontSize: '14px',
  wordBreak: 'break-all' as const
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0'
}

const footerText = {
  color: '#6c757d',
  fontSize: '14px',
  lineHeight: '22px'
}
