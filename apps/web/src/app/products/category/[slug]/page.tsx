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
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {category.products.map((product: CategoryProductCard) => (
            <a
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="aspect-square w-full overflow-hidden rounded-3xl bg-gray-200">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={350}
                    height={350}
                    // 400px, not the 350 the width prop names: the three-column
                    // grid gives each card a 397px box at 1440, so 350 asks for
                    // an asset that then has to be upscaled to fill it.
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
                    className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  // An empty state rather than a placeholder image: it costs no
                  // request, and it makes the missing data visible instead of
                  // papering over it.
                  <div
                    role="img"
                    aria-label={`No image available for ${product.name}`}
                    className="flex h-full w-full items-center justify-center text-sm text-gray-500"
                  >
                    No image available
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {product.name}
                </h2>
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
