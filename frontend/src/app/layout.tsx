// src/app/layout.tsx
import Layout from '@/components/Layout'
import { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'MultiSig Wallet',
  description: 'Multi-Signature Bitcoin Wallet Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}