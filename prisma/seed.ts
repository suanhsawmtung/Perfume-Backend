import { faker } from "@faker-js/faker";
import { Concentration, Gender, InventoryType, OrderPaymentStatus, OrderStatus, PaymentMethod, PaymentStatus, RefundStatus, Role, TransactionDirection, TransactionType } from "@prisma/client";
import moment from "moment";
import { hash } from "../src/lib/hash";
import { prisma } from "../src/lib/prisma";
import { createSlug, ensureUniqueSlug } from "../src/utils/common";
import { getFilePath, removeFolder } from "../src/utils/file";

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
  { name: "Fragrance Families", slug: "fragrance-families" },
  { name: "Scent Longevity Tips", slug: "scent-longevity-tips" },
  { name: "Seasonal Perfume Guides", slug: "seasonal-perfume-guides" },
  { name: "Perfume Notes 101", slug: "perfume-notes-101" },
  { name: "Niche vs Designer", slug: "niche-vs-designer" },
];

// Product seed data
const products = [
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
        price: 150000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://down-my.img.susercontent.com/file/sg-11134201-8261q-mk284nvau4g2e5.webp",
            isPrimary: true,
            order: 0
          },
          {
            path: "https://down-my.img.susercontent.com/file/sg-11134201-8262w-mk284o8k2iv8c5.webp",
            isPrimary: false,
            order: 1
          },
        ]
      },
      {
        size: 90,
        price: 480000,
        discount: 0,
        stock: 20,
        images: [
          {
            path: "https://shins.my/media/catalog/product/cache/4e22e919b2ba2a78127fbd5624ab1858/1/0/10103010200506-800x800_1.jpg",
            isPrimary: true,
            order: 0
          },
          {
            path: "https://fragrancemyra.com/wp-content/uploads/2022/05/8CE5C374-601F-493B-822C-A87755FF042F.png",
            isPrimary: false,
            order: 1
          },
        ]
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
        price: 340000,
        discount: 0,
        stock: 20,
        images: [
          {
            path: "https://cdn.vesira.com/media/catalog/product/cache/5/image/650x/040ec09b1e35df139433887a97daa66f/6/8/689.jpg",
            isPrimary: true,
            order: 0
          },
          {
            path: "https://shins.my/media/catalog/product/cache/4e22e919b2ba2a78127fbd5624ab1858/b/u/buy_4_at_rm99_-_2022-09-06t104855.340.png",
            isPrimary: false,
            order: 1
          },
        ]
      },
      {
        size: 90,
        price: 720000,
        discount: 0,
        stock: 8,
        images: [
          {
            path: "https://image-optimizer-reg.production.sephora-asia.net/images/product_images/closeup_1_Product_185776_20Versace_20Bright_20Crystal_20Absolu_20EDP_2090ml_92ae912c88747d41037977583b100c66c931b8dc_1528361453.png",
            isPrimary: true,
            order: 0
          },
        ]
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
        price: 320000,
        discount: 0,
        stock: 40,
        images: [
          {
            path: "https://www.lojaglamourosa.com/resources/medias/shop/products/thumbnails/shop-image-large/shop-pf-00704-01-le-male-edt-40ml--1.jpg",
            isPrimary: true,
            order: 0
          },
          {
            path: "https://perfumeonline.ca/cdn/shop/products/jean-paul-gaultier-le-male-eau-de-toilette-40ml-p8488-20383_image_1024x1024.jpg?v=1571609925",
            isPrimary: false,
            order: 1
          },
        ]
      },
      {
        size: 75,
        price: 480000,
        discount: 5,
        stock: 9,
        images: [
          {
            path: "https://image-optimizer-reg.production.sephora-asia.net/images/product_images/closeup_1_Product_8435415012638-JEAN-PAUL-GAULTIER-Le-Male-Eau-De-To_838df6d6cfb4d53323cedb910c7a2a43eb66e710_1728632779.png",
            isPrimary: true,
            order: 0
          },
        ]
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
        price: 880000,
        discount: 0,
        stock: 50,
        images: [
          {
            path: "https://a.cdnsbn.com/images/products/xl/26066398006.jpg",
            isPrimary: true,
            order: 0
          },
          {
            path: "https://a.cdnsbn.com/images/products/xl/26066398006-1.jpg",
            isPrimary: false,
            order: 1
          },
        ]
      },
      {
        size: 50,
        price: 1400000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://levelperfume.com/cdn/shop/files/Tom-Ford-Lost-Cherry-50ml-cr_1200x1200.jpg?v=1709016795",
            isPrimary: true,
            order: 0
          },
        ]
      },
    ],
  },
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
        price: 450000,
        discount: 0,
        stock: 25,
        images: [
          {
            path: "https://www.versace.com/dw/image/v2/BGWN_PRD/on/demandware.static/-/Sites-ver-master-catalog/default/dwb90e5c70/original/90_R740008-R050MLS_RNUL_20_Eros~EDT~50~ml-Accessories-Versace-online-store_0_1.jpg?sw=850&q=85&strip=true",
            isPrimary: false,
            order: 1
          },
          {
            path: "https://www.versace.com/dw/image/v2/BGWN_PRD/on/demandware.static/-/Sites-ver-master-catalog/default/dw81139a10/original/90_R740008-R050MLS_RNUL_22_Eros~EDT~50~ml-Accessories-Versace-online-store_0_1.jpg?sw=850&q=85&strip=true",
            isPrimary: false,
            order: 2
          },
          {
            path: "https://www.versace.com/on/demandware.static/-/Library-Sites-ver-library/default/dwbf3cbf93/EROS.jpg",
            isPrimary: false,
            order: 3
          },
          {
            path: "https://cdn.paris-avenues.com/image/cache/catalog/Product2/8011003809202-Versace-Eros-EDT-50-Ml--1000x1000.jpg",
            isPrimary: true,
            order: 0
          },
        ],
      },
    ],
  },
];

export function createRandomUser() {
  return {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
  };
}

export const users = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

// Post seed data
const posts = [
  {
    title: "How to Build a Fragrance Wardrobe",
    excerpt:
      "Choosing a signature scent depends on the occasion, your skin chemistry, and the season you are in.",
    image: "https://eden1.b-cdn.net/wp-content/uploads/2025/12/build-a-fragrance-wardrobe.jpg",
    categorySlug: "fragrance-families",
    content:
      "<p>A fragrance wardrobe is more than just a collection of bottles; it's an extension of your personality. Having different scents for different moods helps you express yourself more effectively.</p><br/>" +
      "<p>Here are common elements of a well-rounded fragrance collection:</p><br/>" +
      "<ol>" +
      "<li><strong>The Fresh Daily:</strong> A clean, citrusy, or aquatic scent perfect for the office or gym.</li>" +
      "<li><strong>The Date Night:</strong> Something warmer with notes of amber, vanilla, or spices to create an inviting aura.</li>" +
      "<li><strong>The Signature:</strong> That one scent people associate with you—usually a balanced floral or woody composition.</li>" +
      "<li><strong>The Seasonal:</strong> Lighter florals for Spring and heavy, gourmand scents for the cold Winter months.</li>" +
      "</ol>",
  },
  {
    title: "5 Tips to Make Your Perfume Last All Day",
    excerpt:
      "Struggling with scent disappearance? Learn the science of pulse points and hydration to keep your fragrance alive.",
    image: "https://rivona.in/cdn/shop/articles/5_Easy_Tips_to_make_your_Perfume.png?v=1760078625",
    categorySlug: "scent-longevity-tips",
    content:
      "<p>Longevity is the biggest challenge for many perfume enthusiasts. Here is how to ensure your scent stays with you from morning to night:</p><br/>" +
      "<ol>" +
      "<li><strong>Moisturize First:</strong> Fragrance clings better to hydrated skin. Apply an unscented lotion before spraying.</li>" +
      "<li><strong>Pulse Points:</strong> Spray on areas where heat is generated—wrists, neck, and behind the ears.</li>" +
      "<li><strong>Don't Rub:</strong> Rubbing your wrists together breaks down the molecules and ruins the top notes.</li>" +
      "<li><strong>Storage Matters:</strong> Keep bottles away from sunlight and bathroom humidity to prevent the juice from spoiling.</li>" +
      "</ol>",
  },
  {
    title: "Understanding Top, Heart, and Base Notes",
    excerpt:
      "Ever wonder why your perfume smells different after an hour? It’s all about the evaporation pyramid.",
    image: "https://cdn.shopify.com/s/files/1/0904/3168/4923/files/Perfume_Making_Basic_Understanding_Top_Middle_Base_Notes_Perfume_Pyramid_Explained_copy.webp?v=1746047901",
    categorySlug: "perfume-notes-101",
    content:
      "<p>Perfume is a living thing that evolves over time. Understanding the pyramid structure is key to buying the right bottle.</p><br/>" +
      "<ul>" +
      "<li><strong>Top Notes:</strong> The initial burst you smell (Citrus, Berries). These last about 15 minutes.</li>" +
      "<li><strong>Heart Notes:</strong> The core of the fragrance (Florals, Spices). These emerge after the top notes fade.</li>" +
      "<li><strong>Base Notes:</strong> The heavy hitters (Oud, Musk, Patchouli). These provide the foundation and last for hours.</li>" +
      "</ul>",
  },
  {
    title: "The Best Floral Scents for Spring 2026",
    excerpt:
      "As the flowers bloom, your scent should too. Discover the top jasmine and rose-based perfumes this season.",
    image: "https://cdn.shopify.com/s/files/1/1026/3879/files/rose_cream_collage.png?v=1774734916",
    categorySlug: "seasonal-perfume-guides",
    content:
      "<p>Spring is the season of rebirth. We recommend looking for perfumes that utilize white florals and green notes.</p><br/>" +
      "<p>Jasmine and Tuberose are currently trending for 2026, offering a sophisticated yet airy feel that matches the warming weather perfectly.</p>",
  },
  {
    title: "Is Niche Perfumery Worth the Price?",
    excerpt:
      "Explore the world of artisanal scents where the ingredients are rare and the storytelling is bold.",
    image: "https://9f8e62d4.delivery.rocketcdn.me/wp-content/uploads/2024/01/What-Are-Niche-Fragrances.jpg",
    categorySlug: "niche-vs-designer",
    content:
      "<p>Niche fragrances are produced by houses dedicated solely to perfume, unlike designer brands that make clothing and accessories.</p><br/>" +
      "<p>While more expensive, niche scents often use higher concentrations of natural oils and offer unique smells that won't make you 'smell like everyone else' in the room.</p>",
  },
  {
    title: "Why Your Skin Chemistry Changes the Scent",
    excerpt:
      "The same perfume can smell radically different on two people. Learn why pH and diet matter.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6wDkJwdGpXJaRlQJXMdyp6KAUGR5V0KyNgg&s",
    categorySlug: "perfume-notes-101",
    content:
      "<p>Your skin's pH level, oiliness, and even your diet can alter how a fragrance develops. People with oily skin tend to hold scent longer, while dry skin requires more frequent reapplication.</p>",
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
  await prisma.productWishlist.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({ where: { role: Role.USER } });
  await prisma.transaction.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  console.log("Cleanup completed.");

  removeFolder(getFilePath("uploads", "images"));

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
        `${product.slug}-${variantData.size}`
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
          price: variantData.price,
          discount: variantData.discount,
          stock: variantData.stock,
          isPrimary,
          productId: product.id,
          images: {
            create: variantData.images?.map((image) => ({
              path: image.path,
              isPrimary: image.isPrimary,
              order: image.order
            })),
          },
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
    update: {
      emailVerifiedAt: new Date(),
    },
    create: {
      email: "admin@example.com",
      username: "admin",
      password: await hash("admin123"),
      refreshToken: faker.internet.jwt(),
      emailVerifiedAt: new Date(),
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
      refreshToken: faker.internet.jwt(),
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
                         productVariantId: randomVariant.id,
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
          productVariantId: randomVariant.id,
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

  // Seed Product Reviews
  console.log("Seeding Product reviews...");
  if (allProducts.length > 0 && allClients.length >= 2) {
    for (const product of allProducts) {
      // Pick 2-4 random unique users from allClients to give ratings
      const raterCount = faker.number.int({ min: 2, max: Math.min(allClients.length, 4) });
      const raters = faker.helpers.arrayElements(allClients, raterCount);

      let totalRating = 0;
      for (const user of raters) {
        const ratingValue = faker.number.int({ min: 1, max: 5 });
        await prisma.review.create({
          data: {
            content: faker.lorem.paragraph(),
            isPublish: true,
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
