import type {
  User,
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Review,
  ShippingAddress,
} from "@prisma/client";

export type { User, Product, Category, Cart, CartItem, Order, OrderItem, Review, ShippingAddress };

export type ProductWithCategory = Product & {
  category: Category;
};

export type ProductWithDetails = Product & {
  category: Category;
  reviews: (Review & { user: Pick<User, "id" | "name"> })[];
};

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product;
  })[];
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
  })[];
};

export type OrderWithUser = Order & {
  user: Pick<User, "id" | "name" | "email">;
  items: (OrderItem & {
    product: Pick<Product, "id" | "name" | "images">;
  })[];
};

export type CustomerWithOrders = User & {
  orders: Order[];
  _count: {
    orders: number;
  };
};
