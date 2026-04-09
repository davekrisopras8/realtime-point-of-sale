import { Metadata } from "next";
import TableManagement from "./_components/table";

export const metadata:Metadata = {
  title: 'Dakries Café & Resto | Table Management'
}

export default function TableManagementPage() {
  return <TableManagement/>
}
