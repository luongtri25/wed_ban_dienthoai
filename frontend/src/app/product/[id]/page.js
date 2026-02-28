import { redirect } from "next/navigation";

export default function ProductAlias({ params }) {
  redirect(`/products/${params.id}`);
}
