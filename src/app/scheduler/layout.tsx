import { SidebarProvider } from "@/components/ui/sidebar"
//  SidebarTrigger
import { AppSidebar } from "@/components/ui/app-sidebar"

export default function SchedulerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-t from-gray-700 via-gray-900 to-black overflow-hidden flex">
      <SidebarProvider>
        <AppSidebar />
            <main className="flex-1 overflow-hidden bg-gradient-to-t from-gray-700 via-gray-900 to-black">
            {/* <SidebarTrigger /> */}
            <div className="h-full">
            {children}
            </div>
            </main>
        </SidebarProvider>
        </div>
    
  )
}
