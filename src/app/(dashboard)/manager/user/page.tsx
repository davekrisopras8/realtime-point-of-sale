import { Metadata } from "next";
import UserManagement from "./_components/user";

export const metadata:Metadata = {
  title: 'Dakries Café & Resto | User Management'
}

export default function UserManagementPage() {
  return <UserManagement/>
}
