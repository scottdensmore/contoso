import Block from "@/components/block";
import Header from "@/components/header";
import { getProductsByCategory } from "@/lib/products";
import { notFound } from "next/navigation";
import Image from "next/image";

type CategoryProductCard = {
  id: string;
  slug: string;
  image: string | null;
  name: string;
  price: number;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const category = await getProductsByCategory(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <Header />
      <Block innerClassName="pt-12 pb-6">
        <div className="text-6xl pb-5 pt-8 subpixel-antialiased font-serif ">
          {category.name}
        </div>
        <div className="text-xl text-gray-600">
          {category.description}
        </div>
      </Block>

      <Block innerClassName="p-8">
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {category.products.map((product: CategoryProductCard) => (
            <a
              key={product.id}
              href={`/products/${product.slug}${
                searchParams?.type ? "?type=" + searchParams.type : ""
              }`}
              className="group"
            >
              <div className="aspect-square w-full overflow-hidden rounded-3xl bg-gray-200">
                <Image
                  src={product.image || "/images/placeholder.png"}
                  alt={product.name}
                  width={350}
                  height={350}
                  className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-lg font-medium text-gray-500">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </a>
          ))}
        </div>
      </Block>
    </>
  );
}
