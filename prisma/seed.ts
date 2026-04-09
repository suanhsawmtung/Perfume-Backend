import { faker } from "@faker-js/faker";
import { Concentration, Gender, InventoryType, OrderItemType, OrderPaymentStatus, OrderStatus, PaymentMethod, PaymentStatus, RefundStatus, Role, TransactionDirection, TransactionType, VariantSource } from "@prisma/client";
import moment from "moment";
import { hash } from "../src/lib/hash";
import { prisma } from "../src/lib/prisma";
import { createSlug, ensureUniqueSlug } from "../src/utils/common";

// Material seed data
// const materials = [
//   { name: "Wooden", slug: "wooden" },
//   { name: "Bamboo", slug: "bamboo" },
//   { name: "Metal", slug: "metal" },
// ];

// Type seed data
// const types = [
//   { name: "Seating", slug: "seating" },
//   { name: "Lying", slug: "lying" },
//   { name: "Tables", slug: "tables" },
//   { name: "Storage", slug: "storage" },
//   { name: "Entertainment", slug: "entertainment" },
// ];

// Brand seed data
const brands = [
  { name: "Versace", slug: "versace" },
  { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier" },
  { name: "Tom Ford", slug: "tom-ford" },
  { name: "Yves Saint Laurent", slug: "yves-saint-laurent" },
  { name: "Lancome", slug: "lancome" },
  { name: "Carolina Herrera", slug: "carolina-herrera" },
];

// Category seed data
const categories = [
  { name: "Furniture Buying Guide", slug: "furniture-buying-guide" },
  { name: "Interior Design Tips", slug: "interior-design-tips" },
  { name: "Furniture Care & Maintenance", slug: "furniture-care-maintenance" },
  { name: "Material Guide", slug: "material-guide" },
  { name: "Home Decor Inspiration", slug: "home-decor-inspiration" },
];

// Product seed data
const products = [
  {
    name: "Versace Eros",
    brandSlug: "versace",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description:
      "A fresh, woody fragrance with vibrant citrus and warm amber notes.",
    releasedYear: 2019,
    variants: [
      {
        size: 50,
        source: VariantSource.ORIGINAL,
        price: 450000,
        discount: 0,
        stock: 25,
      },
    ],
  },
  {
  name: "Versace Bright Crystal",
  brandSlug: "versace",
  concentration: Concentration.EDT,
  gender: Gender.FEMALE,
  description:
    "A fresh, floral-fruity fragrance with notes of yuzu, pomegranate, peony, and soft musk.",
  releasedYear: 2006,
  variants: [
      {
        size: 10,
        source: VariantSource.ORIGINAL,
        price: 150000,
        discount: 0,
        stock: 5,
      },
      {
        size: 90,
        source: VariantSource.ORIGINAL,
        price: 480000,
        discount: 0,
        stock: 20,
      },
    ],
  },
  {
  name: "Versace Bright Crystal Absolu",
  brandSlug: "versace",
  concentration: Concentration.EDP,
  gender: Gender.FEMALE,
  description:
    "A more intense and long-lasting version of Bright Crystal with richer fruity and floral notes.",
  releasedYear: 2013,
  variants: [
      {
        size: 30,
        source: VariantSource.ORIGINAL,
        price: 340000,
        discount: 0,
        stock: 20,
      },
      {
        size: 90,
        source: VariantSource.ORIGINAL,
        price: 720000,
        discount: 0,
        stock: 8,
      },
    ],
  },
  {
    name: "Le Male",
    brandSlug: "jean-paul-gaultier",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description:
      "Iconic lavender and mint blended with warm vanilla and woods.",
    releasedYear: 2015,
    variants: [
      {
        size: 40,
        source: VariantSource.ORIGINAL,
        price: 320000,
        discount: 0,
        stock: 40,
      },
      {
        size: 75,
        source: VariantSource.ORIGINAL,
        price: 480000,
        discount: 5,
        stock: 9,
      },
    ],
  },
  {
    name: "Lost Cherry",
    brandSlug: "tom-ford",
    concentration: Concentration.EDP,
    gender: Gender.UNISEX,
    description:
      "Bold cherry and almond balanced with rich floral and amber accords.",
    releasedYear: 2020,
    variants: [
      {
        size: 30,
        source: VariantSource.ORIGINAL,
        price: 880000,
        discount: 0,
        stock: 50,
      },
      {
        size: 50,
        source: VariantSource.ORIGINAL,
        price: 1400000,
        discount: 0,
        stock: 15,
      },
    ],
  },
];

export function createRandomUser() {
  return {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    randToken: faker.internet.jwt(),
  };
}

export const users = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

// Post seed data
const posts = [
  {
    title: "First Time Home Owner Ideas",
    excerpt:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post-1.jpg",
    content:
      "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "furniture-buying-guide",
  },
  {
    title: "How To Keep Your Furniture Clean",
    excerpt:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post-2.jpg",
    content:
      "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "furniture-care-maintenance",
  },
  {
    title: "Small Space Furniture Apartment Ideas",
    excerpt:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post-3.jpg",
    content:
      "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "interior-design-tips",
  },
  {
    title: "keep living spaces clean and clutter-free",
    excerpt:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post-4.jpg",
    content:
      "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "home-decor-inspiration",
  },
  {
    title: "How To Keep Your Furniture Clean",
    excerpt:
      "The choice of furniture depends on personal preferences, the style of the living space, and the intended use of the furniture.",
    image: "post-5.jpg",
    content:
      "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "furniture-care-maintenance",
  },
  {
    title: "Small Space Furniture Apartment Ideas",
    excerpt:
      "The global smart furniture market size is expected to reach $794.8 million by 2025, growing at a CAGR of 6.4% from 2020 to 2025.",
    image: "post-6.jpg",
    content:
      "<p>Storage furniture is essential for organizing and storing items in homes and offices. It helps to keep living spaces clean and clutter-free, making it easier to find and access items when needed. Storage furniture can also add style and character to a room, enhancing the overall decor of a space.</p><br/><p>Storage furniture is designed to provide storage space for various items in homes and offices. Here are some common uses of storage furniture:</p><br/><ol><li><strong>Organization:</strong> The primary use of storage furniture is to help organize and store various items in homes and offices. This includes items such as clothing, shoes, books, toys, office supplies, and other household items.</li><li><strong>Space-saving:</strong> Storage furniture can also be used to save space in a room. For example, a bed with built-in drawers or shelves can provide additional storage space for clothing and bedding, freeing up space in a closet or dresser.</li><li><strong>Decor</strong>Storage furniture can also be used as decorative pieces in a room. Bookcases, for example, can be used to display books and decorative items while also providing storage space.</li><li><strong>Flexibility:</strong> Storage furniture can be used in various rooms in a home or office. For example, a storage cabinet that is used in a living room to store board games and other items can be moved to a home office to store office supplies.</li><li><strong>Safety:</strong> Storage furniture can also be used to keep hazardous items out of reach of children and pets. Cabinets and lockers can be used to store chemicals, tools, and other items that can be dangerous if not stored properly.</li></ol><br/><br/><p>Overall, storage furniture is an essential part of any functional and organized living space. It helps to keep items organized and easily accessible while also providing additional storage space and enhancing the overall decor of a room.</p>",
    categorySlug: "interior-design-tips",
  },
];

export async function main() {
  console.log("Starting seed...");

  console.log("Cleaning up database...");
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productRating.deleteMany({});
  await prisma.productWishlist.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({ where: { role: Role.USER } });
  await prisma.transaction.deleteMany({});
  console.log("Cleanup completed.");

  // Seed Categories
  // console.log("Seeding Materials...");
  // for (const material of materials) {
  //   await prisma.material.upsert({
  //     where: { slug: material.slug },
  //     update: {},
  //     create: {
  //       name: material.name,
  //       slug: material.slug,
  //     },
  //   });
  //   console.log(`Created/Updated material: ${material.name}`);
  // }

  // Seed Types
  // console.log("Seeding Types...");
  // for (const type of types) {
  //   await prisma.type.upsert({
  //     where: { slug: type.slug },
  //     update: {},
  //     create: {
  //       name: type.name,
  //       slug: type.slug,
  //     },
  //   });
  //   console.log(`Created/Updated type: ${type.name}`);
  // }

  // Seed Categories
  console.log("Seeding Categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
    console.log(`Created/Updated category: ${category.name}`);
  }

  // Seed Brands
  console.log("Seeding Brands...");
  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        name: brand.name,
        slug: brand.slug,
      },
    });
    console.log(`Created/Updated brand: ${brand.name}`);
  }

  // Seed Products and Variants
  console.log("Seeding Products and Variants...");

  for (const productData of products) {
    const brand = await prisma.brand.findUnique({
      where: { slug: productData.brandSlug },
      select: { id: true, name: true },
    });

    if (!brand) {
      console.log(
        `Brand with slug ${productData.brandSlug} not found, skipping product: ${productData.name}`
      );
      continue;
    }

    const baseProductSlug = createSlug(productData.name);
    const existingProduct = await prisma.product.findUnique({
      where: { slug: baseProductSlug },
    });
    const productSlug = await ensureUniqueSlug(
      baseProductSlug,
      !!existingProduct
    );

    const product = await prisma.product.create({
      data: {
        name: productData.name,
        slug: productSlug,
        concentration: productData.concentration,
        gender: productData.gender,
        description: productData.description,
        releasedYear: productData.releasedYear,
        brandId: brand.id,
      },
    });

    for (const [index, variantData] of productData.variants.entries()) {
      const skuBase = createSlug(
        `${brand.name} ${product.name} ${variantData.size}ml`
      ).toUpperCase();
      let sku = skuBase;
      let existingSku = await prisma.productVariant.findUnique({
        where: { sku },
      });
      if (existingSku) {
        sku = `${skuBase}-${faker.string.alphanumeric({
          length: 4,
          casing: "upper",
        })}`;
      }

      const baseVariantSlug = createSlug(
        `${product.slug}-${variantData.size}-${variantData.source}`
      );
      const existingVariant = await prisma.productVariant.findUnique({
        where: { slug: baseVariantSlug },
      });
      const variantSlug = await ensureUniqueSlug(
        baseVariantSlug,
        !!existingVariant
      );

      const isPrimary =
        (variantData as { isPrimary?: boolean }).isPrimary ?? index === 0;

      const variant = await prisma.productVariant.create({
        data: {
          slug: variantSlug,
          sku,
          size: variantData.size,
          source: variantData.source,
          price: variantData.price,
          discount: variantData.discount,
          stock: variantData.stock,
          isPrimary,
          productId: product.id,
        },
      });

      const unitCost = variantData.price - ((20 * variantData.price) / 100);

      const inventory = await prisma.inventory.create({
        data: {
          productVariantId: variant.id,
          quantity: variantData.stock,
          type: InventoryType.PURCHASE,
          unitCost: unitCost,
          totalCost: unitCost * variantData.stock,
          createdAt: moment().subtract(9, "month").toDate(),
          updatedAt: moment().subtract(9, "month").toDate(),
        },
      });

      await prisma.transaction.create({
        data: {
          type: TransactionType.EXPENSE,
          direction: TransactionDirection.OUT,
          amount: unitCost * variantData.stock,
          source: `Inventory Purchase: ${inventory.id} at ${new Date().toISOString()}`,
          createdAt: moment().subtract(9, "month").toDate(),
          updatedAt: moment().subtract(9, "month").toDate(),
        },
      });

    }

    console.log(`Created product with variants: ${product.name}`);
  }

  // Seed Admin User
  console.log("Seeding Admin User...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      username: "admin",
      password: await hash("admin123"),
      randToken: faker.internet.jwt(),
      role: Role.ADMIN,
      firstName: "Admin",
      lastName: "User",
    },
  });
  console.log(`Created/Updated admin user: ${adminUser.email}`);

  // Seed Author User
  console.log("Seeding Author User...");
  const authorUser = await prisma.user.upsert({
    where: { email: "author@example.com" },
    update: {},
    create: {
      email: "author@example.com",
      username: "author",
      password: await hash("author123"),
      randToken: faker.internet.jwt(),
      role: Role.AUTHOR,
      firstName: "Author",
      lastName: "User",
    },
  });
  console.log(`Created/Updated author user: ${authorUser.email}`);

  // Seed Regular Users
  console.log("Seeding Regular Users...");

  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        password: await hash(user.password),
      },
    });
    console.log(
      `Created user with email: ${user.email}, username: ${user.username}`
    );
  }

  // Seed Posts
  console.log("Seeding Posts...");

  // Only use admin and author users as post authors
  const authorIds = [adminUser.id, authorUser.id];
  let authorIndex = 0;

  for (const postData of posts) {
    // Get category by slug
    const category = await prisma.category.findUnique({
      where: { slug: postData.categorySlug },
    });

    if (!category) {
      console.log(
        `Category with slug ${postData.categorySlug} not found, skipping post: ${postData.title}`
      );
      continue;
    }

    // Create slug from title
    const baseSlug = createSlug(postData.title);
    const existingPost = await prisma.post.findUnique({
      where: { slug: baseSlug },
    });
    const slugExists = !!existingPost;
    const slug = await ensureUniqueSlug(baseSlug, slugExists);

    // Alternate between admin and author (only these two users can be post authors)
    const authorId = authorIds[authorIndex];
    authorIndex = authorIndex === 0 ? 1 : 0;

    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title: postData.title,
        slug,
        excerpt: postData.excerpt,
        content: postData.content,
        image: postData.image,
        authorId: authorId ?? adminUser.id,
        categoryId: category.id,
      },
    });
    console.log(`Created/Updated post: ${postData.title}`);
  }

  // Seed Orders
  console.log("Seeding Orders...");

  const allProductVariants = await prisma.productVariant.findMany({
    include: { product: true },
  });

  const allClients = await prisma.user.findMany({
    where: { role: Role.USER },
  });

  if (allClients.length > 0 && allProductVariants.length > 0) {
    const monthsToSeed = 8;
    
    for (let i = 0; i < monthsToSeed; i++) {
        const targetMonth = moment().subtract(i, "month");

        const maxDay = targetMonth.isSame(moment(), "month")
            ? moment().date() // today (e.g., 9)
            : 28;
        
        const isCurrentMonth = i === 0;
        const orderCount = isCurrentMonth ? 8 : 3;
        console.log(`Seeding ${orderCount} orders for ${targetMonth.format("MMMM YYYY")}...`);

        let monthlyRevenue = 0;

        for (let j = 0; j < orderCount; j++) {
            const randomUser = allClients[Math.floor(Math.random() * allClients.length)]!;
            
            let status: OrderStatus;
            if (!isCurrentMonth) {
                // All past months: All orders are DONE
                status = OrderStatus.DONE;
            } else {
                // Current month: 4 are DONE, others are random non-DONE statuses
                if (j < 4) {
                    status = OrderStatus.DONE;
                } else {
                    const statuses = Object.values(OrderStatus).filter(s => s !== OrderStatus.DONE && s !== OrderStatus.CANCELLED);
                    status = statuses[Math.floor(Math.random() * statuses.length)] as OrderStatus;
                }
            }

            const isDone = status === OrderStatus.DONE;
            const paymentStatus = isDone ? OrderPaymentStatus.PAID : OrderPaymentStatus.UNPAID;
            // Spread orders across the month
            const orderDate = targetMonth.clone().date(faker.number.int({ min: 1, max: maxDay })).toDate();
            
            // Create an order
            const createdOrder = await prisma.order.create({
                data: {
                    userId: randomUser.id,
                    code: faker.string.alphanumeric({ length: 15, casing: 'upper' }),
                    totalPrice: 0, // Will update later
                    status: status,
                    paymentStatus: paymentStatus,
                    customerName: `${randomUser.firstName ?? ""} ${randomUser.lastName ?? ""}`.trim().slice(0, 100) || "Anonymous",
                    customerPhone: (randomUser.phone || faker.phone.number()).slice(0, 15),
                    customerAddress: faker.location.streetAddress().slice(0, 255),
                    customerNotes: faker.lorem.sentence().slice(0, 500),
                    createdAt: orderDate,
                    updatedAt: orderDate,
                    ...(status === 'REJECTED' ? { rejectedReason: faker.lorem.sentence().slice(0, 255) } : {})
                }
            });

            // Add 1-3 random products to the order
            const numberOfProducts = faker.number.int({ min: 1, max: 3 });
            let orderTotal = 0;

            for (let k = 0; k < numberOfProducts; k++) {
                 const randomVariant = allProductVariants[Math.floor(Math.random() * allProductVariants.length)]!;
                 const quantity = Math.floor(Math.random() * 2) + 1;
                 const price = Number(randomVariant.price) - (Number(randomVariant.price) * Number(randomVariant.discount) / 100);

                 await prisma.orderItem.create({
                     data: {
                         orderId: createdOrder.id,
                         itemId: randomVariant.id,
                         itemType: OrderItemType.PRODUCT_VARIANT,
                         quantity: quantity,
                         price: price,
                         createdAt: orderDate
                     }
                 });
                 orderTotal += price * quantity;

                 // If order is DONE, create SALE inventory record
                 if (isDone) {
                    const unitCost = price * 0.7; // Assume 30% profit margin for analytics
                    await prisma.inventory.create({
                        data: {
                            productVariantId: randomVariant.id,
                            quantity: quantity,
                            type: InventoryType.SALE,
                            unitCost: unitCost,
                            totalCost: unitCost * quantity,
                            createdAt: orderDate
                        }
                    });
                 }
            }

            // Update order total price
            await prisma.order.update({
                where: { id: createdOrder.id },
                data: { totalPrice: orderTotal }
            });

            // If order is DONE, create payment and transaction
            if (isDone) {
                monthlyRevenue += orderTotal;
                await prisma.payment.create({
                    data: {
                        orderId: createdOrder.id,
                        method: PaymentMethod.BANK_TRANSFER,
                        amount: orderTotal,
                        status: PaymentStatus.SUCCESS,
                        paidAt: orderDate,
                        createdAt: orderDate
                    }
                });

                await prisma.transaction.create({
                    data: {
                        type: TransactionType.PAYMENT,
                        direction: TransactionDirection.IN,
                        amount: orderTotal,
                        source: "Order Payment",
                        reference: `PAY-${createdOrder.code}`,
                        note: `Payment for order ${createdOrder.code}`,
                        createdAt: orderDate
                    }
                });
            }
            
            console.log(`Created ${status} order: ${createdOrder.code} for ${targetMonth.format("MMM YYYY")}`);
        }

        // Add monthly operating expenses (Salary, Wifi, Utilities, etc.)
        if (monthlyRevenue > 0) {
            const operatingExpenses = [
                { name: "Staff Salary", amountRatio: 0.15 },
                { name: "Wifi Bill", amountRatio: 0.02 },
                { name: "Water Bill", amountRatio: 0.01 },
                { name: "Electricity Bill", amountRatio: 0.05 },
                { name: "Office Rent", amountRatio: 0.12 }
            ];

            for (const expense of operatingExpenses) {
                const amount = monthlyRevenue * expense.amountRatio;
                const expenseDate = targetMonth.clone().date(faker.number.int({ min: 1, max: maxDay })).toDate();

                await prisma.transaction.create({
                    data: {
                        type: TransactionType.EXPENSE,
                        direction: TransactionDirection.OUT,
                        amount: amount,
                        source: "Operating Expense",
                        note: expense.name,
                        createdAt: expenseDate,
                        updatedAt: expenseDate,
                    }
                });
            }
            console.log(`Added operating expenses for ${targetMonth.format("MMM YYYY")}`);
        }
    }
  } else {
      console.log("Skipping order seeding: Not enough users or product variants.");
  }

  // Seed Specific Refund Scenarios
  if (allClients.length > 0 && allProductVariants.length > 0) {
    console.log("Seeding specific refund scenarios...");
    const refundScenarios = [
      {
        monthsAgo: 1,
        paymentStatus: OrderPaymentStatus.REFUNDED,
        refundAmountRatio: 1, // Full refund
        desc: "Order 1: 1mo ago, Full Refund"
      },
      {
        monthsAgo: 3,
        paymentStatus: OrderPaymentStatus.PARTIALLY_REFUNDED,
        refundAmountRatio: 0.5, // Half refund
        desc: "Order 2: 3mo ago, Partial Refund"
      },
      {
        monthsAgo: 5,
        paymentStatus: OrderPaymentStatus.PAID,
        refundAmountRatio: 0, // No refund
        desc: "Order 3: 5mo ago, No Refund"
      },
    ];

    for (const scenario of refundScenarios) {
      const randomUser = allClients[Math.floor(Math.random() * allClients.length)]!;
      const orderDate = moment().subtract(scenario.monthsAgo, "month").date(15).toDate();
      const code = faker.string.alphanumeric({ length: 15, casing: 'upper' });

      // Create Order
      const order = await prisma.order.create({
        data: {
          userId: randomUser.id,
          code,
          totalPrice: 0,
          status: OrderStatus.CANCELLED,
          paymentStatus: scenario.paymentStatus,
          customerName: `${randomUser.firstName ?? ""} ${randomUser.lastName ?? ""}`.trim() || "Anonymous",
          customerPhone: (randomUser.phone || faker.phone.number()).slice(0, 15),
          customerAddress: faker.location.streetAddress().slice(0, 255),
          createdAt: orderDate,
          updatedAt: orderDate,
          cancelledReason: "Seeded for refund testing.",
        },
      });

      // Add 1 random product
      const randomVariant = allProductVariants[Math.floor(Math.random() * allProductVariants.length)]!;
      const price = Number(randomVariant.price);
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          itemId: randomVariant.id,
          itemType: OrderItemType.PRODUCT_VARIANT,
          quantity: 1,
          price,
          createdAt: orderDate,
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { totalPrice: price },
      });

      // Payment (Paid)
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: PaymentMethod.BANK_TRANSFER,
          amount: price,
          status: PaymentStatus.SUCCESS,
          paidAt: orderDate,
          createdAt: orderDate,
        },
      });

      // Transaction IN
      await prisma.transaction.create({
        data: {
          type: TransactionType.PAYMENT,
          direction: TransactionDirection.IN,
          amount: price,
          source: "Order Payment",
          reference: `PAY-${code}`,
          createdAt: orderDate,
        },
      });

      // Refund if applicable
      if (scenario.refundAmountRatio > 0) {
        const refundAmount = price * scenario.refundAmountRatio;
        await prisma.refund.create({
          data: {
            orderId: order.id,
            amount: refundAmount,
            reason: "Seeded refund",
            status: RefundStatus.SUCCESS,
            createdAt: orderDate,
          },
        });

        await prisma.transaction.create({
          data: {
            type: TransactionType.REFUND,
            direction: TransactionDirection.OUT,
            amount: refundAmount,
            source: "Order Refund",
            reference: `REF-${code}`,
            createdAt: orderDate,
          },
        });
      }
      console.log(`Created ${scenario.desc}`);
    }
  }

  // Seed Reviews
  console.log("Seeding Reviews...");
  await prisma.review.deleteMany({});

  const allProducts = await prisma.product.findMany();

  if (allProducts.length > 0 && allClients.length >= 2) {
    for (const product of allProducts) {
      // Pick 2 random unique users from allClients
      const selectedUsers = faker.helpers.arrayElements(allClients, 2);

      for (const user of selectedUsers) {
        await prisma.review.create({
          data: {
            content: faker.lorem.paragraph(),
            isPublish: true,
            userId: user.id,
            productId: product.id,
          },
        });
      }
      console.log(`Created 2 reviews for product: ${product.name}`);
    }
  } else {
    console.log("Skipping review seeding: Not enough products or users.");
  }

  // Seed Product Ratings
  console.log("Seeding Product Ratings...");
  if (allProducts.length > 0 && allClients.length >= 2) {
    for (const product of allProducts) {
      // Pick 2-4 random unique users from allClients to give ratings
      const raterCount = faker.number.int({ min: 2, max: Math.min(allClients.length, 4) });
      const raters = faker.helpers.arrayElements(allClients, raterCount);

      let totalRating = 0;
      for (const user of raters) {
        const ratingValue = faker.number.int({ min: 1, max: 5 });
        await prisma.productRating.create({
          data: {
            userId: user.id,
            productId: product.id,
            rating: ratingValue,
          },
        });
        totalRating += ratingValue;
      }

      // Update product with average rating and count
      await prisma.product.update({
        where: { id: product.id },
        data: {
          rating: totalRating / raterCount,
          ratingCount: raterCount,
        },
      });

      console.log(`Created ${raterCount} ratings for product: ${product.name}`);
    }
  } else {
    console.log("Skipping product rating seeding: Not enough products or users.");
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
