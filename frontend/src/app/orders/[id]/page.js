import OrderDetailClient from "@/components/OrderDetailClient";

export const metadata = {
  title: "Chi tiết đơn hàng",
  description: "Trang chi tiết đơn hàng.",
};

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}

