import { faker } from "@faker-js/faker";
import { Concentration, Gender, InventoryType, OrderPaymentStatus, OrderStatus, PaymentMethod, PaymentStatus, PostStatus, RefundStatus, Role, TransactionDirection, TransactionType } from "@prisma/client";
import moment from "moment";
import { hash } from "../src/lib/hash";
import { prisma } from "../src/lib/prisma";
import { recalculateUserPoints } from "../src/services/user/user.helpers";
import { createSlug, ensureUniqueSlug } from "../src/utils/common";
import { getFilePath, removeFolder } from "../src/utils/file";

import { brands, categories, products, posts } from "./data";

export function createRandomUser() {
  return {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: "password123",
    emailVerifiedAt: new Date(),
  };
}

export const users = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

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
        email: user.email.toLowerCase(),
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
        publishedAt: moment().toDate(),
        status: PostStatus.PUBLISHED,

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
            image: "https://scontent.fkul8-2.fna.fbcdn.net/v/t39.30808-6/605866286_869566848795608_7694348803099753370_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=v5Hoh8FZGDUQ7kNvwFx_lIW&_nc_oc=AdpsJUoFPLdLy3j1O9R1SPrZvH7RJ5OvA-EDcRYgZWK2jQfGPErURd03s4Fm3_lAL_WtaS6Q_fmS1Lj0GArowOGt&_nc_zt=23&_nc_ht=scontent.fkul8-2.fna&_nc_gid=Jees17g3HiQO91bikO5VdA&_nc_ss=7b2a8&oh=00_Af9qz1QNHko7N2_Jv7AlxM61XZna5f0-8hKiOyLD0zZkGw&oe=6A220D53",
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
          image: "https://scontent.fkul8-2.fna.fbcdn.net/v/t39.30808-6/605866286_869566848795608_7694348803099753370_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=v5Hoh8FZGDUQ7kNvwFx_lIW&_nc_oc=AdpsJUoFPLdLy3j1O9R1SPrZvH7RJ5OvA-EDcRYgZWK2jQfGPErURd03s4Fm3_lAL_WtaS6Q_fmS1Lj0GArowOGt&_nc_zt=23&_nc_ht=scontent.fkul8-2.fna&_nc_gid=Jees17g3HiQO91bikO5VdA&_nc_ss=7b2a8&oh=00_Af9qz1QNHko7N2_Jv7AlxM61XZna5f0-8hKiOyLD0zZkGw&oe=6A220D53",
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

  // Recalculate Points for all users
  console.log("Recalculating User Points...");
  const allUsers = await prisma.user.findMany({
    select: { id: true },
  });

  for (const user of allUsers) {
    await recalculateUserPoints(user.id);
  }
  console.log(`Recalculated points for ${allUsers.length} users.`);

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
