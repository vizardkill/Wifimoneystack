import type { JSX } from 'react'

import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from '@react-email/components'

interface PasswordResetTemplateProps {
  resetUrl: string
}

const hostPort = process.env.HOST_PORT
const portSegment = typeof hostPort === 'string' && hostPort.length > 0 ? hostPort : ''
const baseUrl = process.env.NGROK_URL || `${process.env.HOST_PROTOCOL}://${process.env.HOST_NAME}${portSegment}`

export const PasswordResetTemplate = ({ resetUrl }: PasswordResetTemplateProps): JSX.Element => (
  <Html>
    <Head />
    <Preview>Restablece tu contraseña</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={`${baseUrl}/apple-icon.png`} width="100" alt="Logo" />
        </Section>
        <Heading style={h1}>Restablece tu contraseña</Heading>
        <Text style={text}>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para elegir una nueva.</Text>
        <Section style={buttonSection}>
          <Button style={button} href={resetUrl}>
            Restablecer Contraseña
          </Button>
        </Section>

        <Text style={text}>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</Text>
        <Link href={resetUrl} style={link}>
          {resetUrl}
        </Link>

        <Text style={text}>Si no solicitaste esto, puedes ignorar este correo de forma segura.</Text>
        <Hr style={hr} />
      </Container>
    </Body>
  </Html>
)

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 40px', borderRadius: '8px', border: '1px solid #e6ebf1', maxWidth: '480px' }
const h1 = { color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, margin: '30px 0' }
const text = { color: '#3c4043', fontSize: '16px', lineHeight: '24px' }
const logoSection = { textAlign: 'center' as const, padding: '0' }
const buttonSection = { textAlign: 'center' as const, margin: '32px 0' }
const link = { color: '#1a73e8', textDecoration: 'underline' }
const hr = { borderColor: '#e6ebf1', margin: '20px 0' }
const button = {
  backgroundColor: '#000000',
  borderRadius: '5px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 24px'
}
