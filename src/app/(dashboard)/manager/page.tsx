import { Metadata } from "next";
import Dashboard from "./_components/dashboard";

export const metadata: Metadata = {
  title: "Dakries Café & Resto | Dashboard",
};

export default function MenuManagementPage() {
  return <Dashboard />;
}
