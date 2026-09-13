import Block from "@/components/block";
import Header from "@/components/header";
import ProductFilter from "@/components/product-filter";
import { getProductsByCategory } from "@/lib/products";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getProductsByCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <Header />
      <Block innerClassName="pt-12 pb-6">
        <h1 className="text-6xl pb-5 pt-8 subpixel-antialiased font-serif ">
          {category.name}
        </h1>
        <div className="text-xl text-gray-600">
          {category.description}
        </div>
      </Block>

      <Block innerClassName="p-8">
        <ProductFilter
          products={category.products}
          categoryName={category.name}
        />
      </Block>
    </>
  );
}
