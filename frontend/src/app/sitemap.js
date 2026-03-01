import { siteConfig } from "@/lib/site";
import { getProducts } from "@/lib/api";

export default async function sitemap() {
  const products = await getProducts();
  const base = siteConfig.url;
  const routes = ["", "/products"].map(
    (route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: route === "" ? 1 : 0.7,
    })
  );

  const productRoutes = products.map((p) => ({
    url: `${siteConfig.url}/products/${p.slug || p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...routes, ...productRoutes];
}

