import { Metadata } from "next";
import OrderManagement from "./_components/order";

export const metadata:Metadata = {
  title: 'Dakries Café & Resto | Order Management'
}

export default function OrderManagementPage() {
  return <OrderManagement/>
}
