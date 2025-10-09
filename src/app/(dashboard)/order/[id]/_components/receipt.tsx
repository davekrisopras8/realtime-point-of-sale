import { Button } from "@/components/ui/button";
import { usePricing } from "@/hooks/use-pricing";
import { convertIDR } from "@/lib/utils";
import { Menu } from "@/validations/menu-validation";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const Receipt = ({
  order,
  orderMenu,
  orderId,
}: {
  order: {
    customer_name: string;
    tables: { name: string }[];
    status: string;
    created_at: string;
  };
  orderMenu:
    | {
        menus: Menu;
        quantity: number;
        status: string;
        id: string;
      }[]
    | null
    | undefined;
  orderId: string;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { grandTotal, totalPrice, tax, service } = usePricing(orderMenu);

  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <div className="relative">
      <Button onClick={reactToPrintFn}>Print Receipt</Button>
      <div
        className="w-full flex flex-col p-8 absolute -z-10 top-0"
        ref={contentRef}
      >
        <h4 className="text-2xl font-bold text-center">
          Dakries Café & Resto
        </h4>
        <p className="text-xs text-center mt-1">
          Jl. Dave Krisopras Essanto, No. 1, Mojokerto
        </p>
        <p className="text-xs text-center mb-4">
          Telp: (0813) 987-15412
        </p>
        <div className="border-b border-dashed"></div>

        <div className="py-4 border-b border-dashed text-sm space-y-2">
          <p>
            Bill No: <span className="font-bold">{orderId}</span>
          </p>
          <p>
            Customer: <span className="font-bold">{order?.customer_name}</span>
          </p>
          <p>
            Table:{" "}
            <span className="font-bold">
              {(order?.tables as unknown as { name: string })?.name}
            </span>
          </p>
          <p>
            Date:{" "}
            <span className="font-bold">
              {new Date(order?.created_at).toLocaleDateString()}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2 py-4 border-b border-dashed text-sm">
          {orderMenu?.map((item) => (
            <div className="flex justify-between items-center" key={item.id}>
              <p>
                {item.menus.name} x {item.quantity}
              </p>
              <p>{convertIDR(item.menus.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 py-4 border-b border-dashed text-sm">
          <div className="flex justify-between items-center">
            <p>Subtotal</p>
            <p>{convertIDR(totalPrice)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p>Tax</p>
            <p>{convertIDR(tax)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p>Service</p>
            <p>{convertIDR(service)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center py-4 text-sm font-bold border-b border-dashed">
          <p>Total</p>
          <p>{convertIDR(grandTotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
