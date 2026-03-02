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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu link de acesso — ObraBoa</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://uyieimkvkrplvxvwatan.supabase.co/storage/v1/object/public/email-assets/logo-obraboa-navy.svg"
          alt="ObraBoa"
          width="160"
          height="44"
          style={{ margin: '0 0 24px' }}
        />
        <Heading style={h1}>Seu link de acesso 🔗</Heading>
        <Text style={text}>
          Clique no botão abaixo para entrar no ObraBoa. Este link expira em breve.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Entrar no ObraBoa
        </Button>
        <Text style={footer}>
          Se você não solicitou este link, pode ignorar este e-mail com tranquilidade.
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

export default MagicLinkEmail

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
