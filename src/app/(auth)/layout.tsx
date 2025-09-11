import { DarkmodeToggle } from "@/components/common/darkmode-toggle"
import { ChefHat } from "lucide-react"
import type { ReactNode } from "react"
import Image from "next/image"
import restaurantBg from "@/assets/images/restaurant-login-bg.jpg"
import Link from "next/link"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center gap-3 font-medium w-full">
          <Link href="" className="flex items-center gap-3 font-medium group">
            <div className="bg-cyan-500 flex size-8 items-center justify-center rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-200">
              <ChefHat className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Dakries Café & Resto
            </span>
          </Link>
          <div className="ml-auto">
            <DarkmodeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            {children}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          © 2026 Dakries Café & Resto. All rights reserved.
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src={restaurantBg}
          alt="Restaurant Background"
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
      </div>
    </div>
  )
}
