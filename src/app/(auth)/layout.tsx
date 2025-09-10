import { DarkmodeToggle } from "@/components/common/darkmode-toggle";
import { ChefHat } from "lucide-react";
import { ReactNode } from "react";
import Image from "next/image";
import restaurantBg from "@/assets/images/restaurant-login-bg.jpg";
import Link from "next/link";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center gap-2 font-medium w-full">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-cyan-500 flex size-6 items-center justify-center rounded-md">
              <ChefHat className="size-4 text-white" />
            </div>
            Dakries Café & Resto
          </Link>
          <div className="ml-auto">
            <DarkmodeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
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
  );
}


