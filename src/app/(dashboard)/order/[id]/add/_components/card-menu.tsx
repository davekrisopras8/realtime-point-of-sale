import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function CardMenu({
  menu,
  onAddToCart,
}: {
  menu: Menu;
  onAddToCart: (menu: Menu, action: "increment" | "decrement") => void;
}) {
  return (
    <Card key={menu.id} className="w-full h-fit border shadow-sm p-0 gap-0">
      <Image
        src={`${menu.image_url}`}
        alt={menu.name}
        width={400}
        height={400}
        className="w-full object-cover rounded-t-lg"
      />
      <CardContent className="px-3 py-2 sm:px-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold line-clamp-1">
          {menu.name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {menu.description}
        </p>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 flex justify-between items-center gap-2">
        <div className="text-sm sm:text-base lg:text-xl font-bold flex-1 min-w-0">
          {convertIDR(menu.price)}
        </div>
        <Button
          className="cursor-pointer flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 p-0"
          onClick={() => onAddToCart(menu, 'increment')}
          size="sm"
        >
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
