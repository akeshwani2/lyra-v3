import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import Providers from "@/components/ui/Providers"
import { Toaster } from "react-hot-toast"
export default function PDFLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-t from-gray-700 via-gray-900 to-black overflow-hidden flex">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 overflow-hidden bg-gradient-to-t from-gray-700 via-gray-900 to-black">
            <div className="h-full">
              {children}
              <Toaster />
            </div>
          </main>
        </SidebarProvider>
      </div>
    </Providers>
  )
}
