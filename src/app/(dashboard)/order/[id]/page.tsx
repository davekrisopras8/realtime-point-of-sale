import { Metadata } from "next";
import DetailOrder from "./_components/detail-order";
import Script from "next/script";
import { environment } from "@/configs/environment";

export const metadata: Metadata = {
  title: "Dakries Café & Resto | Detail Order",
};

declare global {
  interface Window {
    snap: any;
  }
}

export default async function DetailOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="w-full">
      <Script
        src={`${environment.MIDTRANS_API_URL}/snap/snap.js`}
        data-client-key={environment.MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <DetailOrder id={id} />
    </div>
  );
}
