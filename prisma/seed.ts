import { PrismaClient, Role, OrderStatus, PaymentStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.shippingAddress.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await hash("password123", 12);
  const userPassword = await hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@luxe.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: "user@luxe.com",
      password: userPassword,
      role: Role.CUSTOMER,
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Outerwear",
        slug: "outerwear",
        image: "/images/products/product-01.jpg",
        description:
          "Exquisite outerwear crafted from the finest materials for timeless sophistication.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Tops",
        slug: "tops",
        image: "/images/products/product-05.jpg",
        description:
          "Refined tops that blend impeccable tailoring with effortless elegance.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Bottoms",
        slug: "bottoms",
        image: "/images/products/product-09.jpg",
        description:
          "Luxury bottoms designed for both comfort and distinguished style.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Shoes",
        slug: "shoes",
        image: "/images/products/product-13.jpg",
        description:
          "Handcrafted footwear that embodies artisanal excellence and modern design.",
      },
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        image: "/images/products/product-17.jpg",
        description:
          "Curated accessories that add the perfect finishing touch to any ensemble.",
      },
    }),
  ]);

  // Create products (prices in cents: $28.90 = 2890 cents)
  const productsData = [
    // Outerwear (4 products)
    {
      name: "Cashmere Overcoat",
      slug: "cashmere-overcoat",
      description:
        "A masterfully tailored overcoat in pure Italian cashmere. Features a notched lapel, concealed button closure, and silk lining. The epitome of winter luxury.",
      price: 289000,
      compareAtPrice: 320000,
      images: ["/images/products/product-01.jpg"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: categories[0].id,
      stock: 15,
      featured: true,
    },
    {
      name: "Wool Blend Trench",
      slug: "wool-blend-trench",
      description:
        "Classic double-breasted trench coat in a premium wool-cashmere blend. Storm flap, epaulettes, and belted waist create a silhouette of refined authority.",
      price: 195000,
      compareAtPrice: null,
      images: ["/images/products/product-02.jpg"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: categories[0].id,
      stock: 22,
      featured: false,
    },
    {
      name: "Leather Moto Jacket",
      slug: "leather-moto-jacket",
      description:
        "Hand-stitched lambskin leather jacket with asymmetric zip closure. Quilted panels and antique brass hardware add an edge to this timeless piece.",
      price: 245000,
      compareAtPrice: 280000,
      images: ["/images/products/product-03.jpg"],
      sizes: ["S", "M", "L"],
      categoryId: categories[0].id,
      stock: 10,
      featured: true,
    },
    {
      name: "Down Puffer Vest",
      slug: "down-puffer-vest",
      description:
        "Lightweight yet incredibly warm goose down vest with a matte shell finish. Channel quilting and stand collar for understated winter elegance.",
      price: 89000,
      compareAtPrice: null,
      images: ["/images/products/product-04.jpg"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: categories[0].id,
      stock: 30,
      featured: false,
    },
    // Tops (4 products)
    {
      name: "Silk Blend Blazer",
      slug: "silk-blend-blazer",
      description:
        "Impeccably structured blazer in a luxurious silk-wool blend. Peak lapels, functioning cuff buttons, and a half-canvas construction define this statement piece.",
      price: 168000,
      compareAtPrice: 190000,
      images: ["/images/products/product-05.jpg"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: categories[1].id,
      stock: 18,
      featured: true,
    },
    {
      name: "Merino Wool Turtleneck",
      slug: "merino-wool-turtleneck",
      description:
        "Ultra-fine merino wool turtleneck with a relaxed fit. Ribbed cuffs and hem, finished with a seamless construction for unparalleled comfort.",
      price: 42000,
      compareAtPrice: null,
      images: ["/images/products/product-06.jpg"],
      sizes: ["XS", "S", "M", "L", "XL"],
      categoryId: categories[1].id,
      stock: 45,
      featured: false,
    },
    {
      name: "Linen Camp Collar Shirt",
      slug: "linen-camp-collar-shirt",
      description:
        "Relaxed-fit camp collar shirt in washed Belgian linen. Mother-of-pearl buttons and a box pleat back add subtle refinement to this resort essential.",
      price: 38000,
      compareAtPrice: 45000,
      images: ["/images/products/product-07.jpg"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: categories[1].id,
      stock: 35,
      featured: false,
    },
    {
      name: "Cashmere V-Neck Sweater",
      slug: "cashmere-v-neck-sweater",
      description:
        "Lightweight cashmere sweater with a classic V-neck. Fully fashioned construction ensures a perfect drape that elevates any outfit.",
      price: 59000,
      compareAtPrice: null,
      images: ["/images/products/product-08.jpg"],
      sizes: ["S", "M", "L", "XL"],
      categoryId: categories[1].id,
      stock: 28,
      featured: true,
    },
    // Bottoms (4 products)
    {
      name: "Tailored Wool Trousers",
      slug: "tailored-wool-trousers",
      description:
        "Sharp flat-front trousers in Super 130s wool. Half-lined with a mid-rise fit and tapered leg. Perfect for the boardroom or an evening out.",
      price: 68000,
      compareAtPrice: null,
      images: ["/images/products/product-09.jpg"],
      sizes: ["28", "30", "32", "34", "36"],
      categoryId: categories[2].id,
      stock: 40,
      featured: false,
    },
    {
      name: "Japanese Selvedge Denim",
      slug: "japanese-selvedge-denim",
      description:
        "Premium Japanese selvedge denim with a slim-straight fit. Raw indigo wash with subtle fading. Chain-stitched hems and copper rivets throughout.",
      price: 42000,
      compareAtPrice: 48000,
      images: ["/images/products/product-10.jpg"],
      sizes: ["28", "30", "32", "34", "36"],
      categoryId: categories[2].id,
      stock: 50,
      featured: true,
    },
    {
      name: "Pleated Wide-Leg Pants",
      slug: "pleated-wide-leg-pants",
      description:
        "Elegantly pleated wide-leg trousers in a fluid crepe fabric. High waist with a flowing silhouette that moves beautifully with every step.",
      price: 52000,
      compareAtPrice: null,
      images: ["/images/products/product-11.jpg"],
      sizes: ["XS", "S", "M", "L"],
      categoryId: categories[2].id,
      stock: 25,
      featured: false,
    },
    {
      name: "Cotton Chinos",
      slug: "cotton-chinos",
      description:
        "Garment-dyed cotton chinos with a broken-in softness. Slim fit through the thigh with a clean taper. The perfect balance of casual and polished.",
      price: 29000,
      compareAtPrice: 34000,
      images: ["/images/products/product-12.jpg"],
      sizes: ["28", "30", "32", "34", "36"],
      categoryId: categories[2].id,
      stock: 60,
      featured: false,
    },
    // Shoes (4 products)
    {
      name: "Italian Leather Oxford",
      slug: "italian-leather-oxford",
      description:
        "Hand-burnished calfskin Oxford shoes with Goodyear welt construction. Blake-stitched leather sole and hand-painted patina for a truly bespoke feel.",
      price: 125000,
      compareAtPrice: null,
      images: ["/images/products/product-13.jpg"],
      sizes: ["40", "41", "42", "43", "44", "45"],
      categoryId: categories[3].id,
      stock: 12,
      featured: true,
    },
    {
      name: "Suede Chelsea Boots",
      slug: "suede-chelsea-boots",
      description:
        "Sleek Chelsea boots in butter-soft Italian suede. Elastic side panels, pull tab, and a stacked leather heel. From street to soirée.",
      price: 89000,
      compareAtPrice: 105000,
      images: ["/images/products/product-14.jpg"],
      sizes: ["40", "41", "42", "43", "44", "45"],
      categoryId: categories[3].id,
      stock: 20,
      featured: false,
    },
    {
      name: "Minimalist Leather Sneaker",
      slug: "minimalist-leather-sneaker",
      description:
        "Clean-lined sneakers in full-grain Nappa leather. Margom rubber outsole and memory foam insole. The luxury approach to everyday footwear.",
      price: 56000,
      compareAtPrice: null,
      images: ["/images/products/product-15.jpg"],
      sizes: ["40", "41", "42", "43", "44", "45"],
      categoryId: categories[3].id,
      stock: 35,
      featured: true,
    },
    {
      name: "Woven Leather Loafers",
      slug: "woven-leather-loafers",
      description:
        "Intricately hand-woven leather loafers with a flexible Blake construction. Leather lined with a padded insole for all-day refinement.",
      price: 78000,
      compareAtPrice: 92000,
      images: ["/images/products/product-16.jpg"],
      sizes: ["40", "41", "42", "43", "44"],
      categoryId: categories[3].id,
      stock: 16,
      featured: false,
    },
    // Accessories (4 products)
    {
      name: "Leather Weekend Bag",
      slug: "leather-weekend-bag",
      description:
        "Full-grain vegetable-tanned leather weekend bag with brass hardware. Cotton twill lining, multiple interior pockets, and adjustable shoulder strap.",
      price: 145000,
      compareAtPrice: null,
      images: ["/images/products/product-17.jpg"],
      sizes: ["ONE SIZE"],
      categoryId: categories[4].id,
      stock: 8,
      featured: true,
    },
    {
      name: "Cashmere Scarf",
      slug: "cashmere-scarf",
      description:
        "Generously sized scarf in 100% Mongolian cashmere. Delicate fringe edges and an impossibly soft hand feel. Available in timeless neutral tones.",
      price: 32000,
      compareAtPrice: 38000,
      images: ["/images/products/product-18.jpg"],
      sizes: ["ONE SIZE"],
      categoryId: categories[4].id,
      stock: 40,
      featured: false,
    },
    {
      name: "Titanium Sunglasses",
      slug: "titanium-sunglasses",
      description:
        "Lightweight titanium frame sunglasses with Carl Zeiss polarized lenses. Japanese-made with spring hinges and an anti-reflective coating.",
      price: 68000,
      compareAtPrice: null,
      images: ["/images/products/product-19.jpg"],
      sizes: ["ONE SIZE"],
      categoryId: categories[4].id,
      stock: 25,
      featured: false,
    },
    {
      name: "Italian Leather Belt",
      slug: "italian-leather-belt",
      description:
        "Hand-finished calfskin belt with a brushed palladium buckle. Edge-painted and stitched by hand in Florence. The quintessential luxury accessory.",
      price: 29000,
      compareAtPrice: 34000,
      images: ["/images/products/product-20.jpg"],
      sizes: ["85", "90", "95", "100", "105"],
      categoryId: categories[4].id,
      stock: 50,
      featured: false,
    },
  ];

  const products = await Promise.all(
    productsData.map((p) => prisma.product.create({ data: p }))
  );

  // Create reviews
  const reviewsData = [
    {
      userId: customer.id,
      productId: products[0].id,
      rating: 5,
      comment:
        "Absolutely stunning overcoat. The cashmere is incredibly soft and the tailoring is impeccable.",
    },
    {
      userId: customer.id,
      productId: products[2].id,
      rating: 4,
      comment:
        "Beautiful leather jacket. Fits perfectly and the quality is outstanding.",
    },
    {
      userId: customer.id,
      productId: products[4].id,
      rating: 5,
      comment:
        "This blazer is a work of art. The silk blend gives it a beautiful sheen.",
    },
    {
      userId: customer.id,
      productId: products[7].id,
      rating: 5,
      comment:
        "The softest cashmere I have ever worn. Worth every penny.",
    },
    {
      userId: customer.id,
      productId: products[9].id,
      rating: 4,
      comment:
        "Great quality selvedge denim. The raw indigo will age beautifully.",
    },
    {
      userId: customer.id,
      productId: products[12].id,
      rating: 5,
      comment:
        "These Oxfords are handcrafted perfection. The patina is gorgeous.",
    },
    {
      userId: customer.id,
      productId: products[14].id,
      rating: 4,
      comment:
        "Minimalist design with maximum quality. Very comfortable for all-day wear.",
    },
    {
      userId: customer.id,
      productId: products[16].id,
      rating: 5,
      comment:
        "The leather is exceptional. Perfect size for a weekend getaway.",
    },
    {
      userId: admin.id,
      productId: products[0].id,
      rating: 5,
      comment:
        "Our best-selling overcoat for a reason. Truly exceptional craftsmanship.",
    },
    {
      userId: admin.id,
      productId: products[4].id,
      rating: 4,
      comment:
        "A versatile piece that works from the office to evening events.",
    },
  ];

  await Promise.all(
    reviewsData.map((r) => prisma.review.create({ data: r }))
  );

  // Create orders (one per status)
  const statuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  for (let i = 0; i < statuses.length; i++) {
    const orderProducts = [products[i * 2], products[i * 2 + 1]];
    const total = orderProducts.reduce(
      (sum, p) => sum + p.price,
      0
    );

    const orderNumber = `LUXE-20260222-${String(i + 1).padStart(3, "0")}`;

    await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber,
        status: statuses[i],
        paymentStatus: statuses[i] === OrderStatus.CANCELLED ? PaymentStatus.EXPIRED : PaymentStatus.PAID,
        total,
        shippingAddress: `${123 + i} Fifth Avenue`,
        shippingCity: "New York",
        shippingZip: `1000${i}`,
        shippingCountry: "United States",
        createdAt: new Date(
          Date.now() - (statuses.length - i) * 7 * 24 * 60 * 60 * 1000
        ),
        items: {
          create: orderProducts.map((p) => ({
            productId: p.id,
            size: p.sizes[0],
            quantity: 1,
            price: p.price,
          })),
        },
      },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
