import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, ArrowRight, Utensils, ChefHat } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-black to-zinc-900/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-zinc-700/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <Card className="w-full max-w-lg bg-zinc-900/90 backdrop-blur-xl border-zinc-800/50 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-8 pt-12">
          <div className="mx-auto mb-6 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="flex items-center gap-1">
                <ChefHat className="w-6 h-6 text-zinc-300" />
              </div>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-600 to-zinc-700 rounded-2xl blur opacity-20" />
          </div>

          <CardTitle className="text-4xl font-bold text-white mb-2 tracking-tight">Dakries Café & Resto</CardTitle>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-600 to-transparent mx-auto mb-4" />
          <p className="text-zinc-400 text-sm font-medium tracking-wider uppercase">Point of Sale System</p>
        </CardHeader>

        <CardContent className="text-center space-y-8 pb-12">
          <div className="space-y-2">
            <p className="text-zinc-500 text-sm font-medium">Welcome back,</p>
            <p className="text-xl font-semibold text-zinc-200">Dave Krisopras Essanto</p>
          </div>

          <Link href="/manager" className="block">
            <Button className="w-full bg-cyan-500 hover:bg-cyan-700 text-white border border-zinc-700 hover:border-zinc-600 transition-all duration-300 text-base py-6 rounded-xl group shadow-lg hover:shadow-xl">
              <span className="flex items-center justify-center gap-3">
                Access Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>

          <p className="text-zinc-600 text-xs mt-6">© 2026 Dakries Café & Resto. All rights reserved.
</p>
        </CardContent>
      </Card>
    </div>
  )
}
