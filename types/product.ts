export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  status: string;
  featured: boolean;
  createdAt: string;
}
