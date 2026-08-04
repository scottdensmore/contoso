export interface ChatTurn {
  // Set on turns that will be replaced in place. Positional replacement breaks
  // as soon as two sends overlap, because "the last turn" may belong to the
  // other request.
  id?: string;
  name: string;
  avatar: string;
  message: string;
  status: "waiting" | "done";
  type: "user" | "assistant";
};

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  slug: string;
  manual: string;
  images: string[];
};

export interface ProductGroup {
    name: string;
    slug: string;
    description: string;
    products: Product[];
};
