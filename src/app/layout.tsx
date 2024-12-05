import type { Metadata } from "next"
import localFont from "next/font/local"
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import "./globals.css"
import { Inter } from 'next/font/google'
import logo from "@/assets/logo.svg"
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/ui/app-sidebar"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

const inter = Inter({
  subsets: ['latin'],
})

export const metadata = {
  title: 'Lyra',
  description: 'AI-powered productivity tools',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-copy.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#8B5CF6",
          colorBackground: "#1F2937",
          colorText: "#FFFFFF",
          colorInputBackground: "#374151",
          colorInputText: "#FFFFFF",
        },
        elements: {
          card: "bg-gray-900/90 backdrop-blur-xl border border-purple-500/20",
          headerTitle: "text-white",
          headerSubtitle: "text-purple-200",
          formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-500",
          formFieldInput: "bg-gray-800/60 border-gray-700",
        }
      }}
      dynamic={true}
    >
      <html lang="en" className="h-full">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
} 