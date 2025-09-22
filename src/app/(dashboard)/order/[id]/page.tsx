import { Metadata } from "next";
import DetailOrder from "./_components/detail-order";

export const metadata: Metadata = {
  title: "Dakries Café & Resto | Detail Order",
};

export default async function DetailOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailOrder id={id} />;
}
