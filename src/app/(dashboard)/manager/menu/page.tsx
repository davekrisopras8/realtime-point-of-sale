import { Metadata } from "next";
import MenuManagement from "./_components/menu";

export const metadata:Metadata = {
  title: 'Dakries Café & Resto | Menu Management'
}

export default function MenuManagementPage() {
  return <MenuManagement/>
}
