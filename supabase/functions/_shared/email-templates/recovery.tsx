/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Redefinir sua senha — ObraBoa</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://uyieimkvkrplvxvwatan.supabase.co/storage/v1/object/public/email-assets/logo-obraboa-navy.svg"
          alt="ObraBoa"
          width="160"
          height="44"
          style={{ margin: '0 0 24px' }}
        />
        <Heading style={h1}>Redefinir sua senha 🔑</Heading>
        <Text style={text}>
          Recebemos uma solicitação para redefinir a senha da sua conta no ObraBoa.
          Clique no botão abaixo para criar uma nova senha:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Redefinir senha
        </Button>
        <Text style={footer}>
          Se você não solicitou a redefinição, pode ignorar este e-mail.
          Sua senha não será alterada.
        </Text>
        <Text style={footerBrand}>
          ObraBoa — O assistente da sua Obra 🏠
          <br />
          <Link href="https://www.obraboa.app.br" style={footerLink}>
            www.obraboa.app.br
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Nunito', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#1B3A5C',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#64748B',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const button = {
  backgroundColor: '#1B3A5C',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '32px 0 0' }
const footerBrand = { fontSize: '12px', color: '#94a3b8', margin: '24px 0 0', lineHeight: '1.6' }
const footerLink = { color: '#F59E0B', textDecoration: 'none' }
