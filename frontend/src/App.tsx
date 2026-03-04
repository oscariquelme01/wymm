import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/layout/DashboardLayout"
import Dashboard from "@/pages/dashboard/Dashboard"
import Auth from "@/pages/Auth"
import Analytics from "@/pages/analytics/Analytics"
import Transactions from "@/pages/transactions/Transactions"
import Categories from "@/pages/categories/Categories"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import "@/index.css"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="wimm-ui-theme">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/categories" element={<Categories />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
