import { Gender, InventoryType, PostStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import { HomeDataT } from "../../types/home";
import { IHomeService } from "./home.interface";

export class HomeService implements IHomeService {
  async getHomeData(
    userId?: string | number,
    gender?: string
  ): Promise<ServiceResponseT<HomeDataT>> {
    const genderFilter = this.buildHomeProductGenderFilter(gender);

    const bestSellerProducts = await this.getBestSellerProducts(4, genderFilter);
    const bestSellerIds = bestSellerProducts.map((p: any) => p.id);

    const [productsForYou, latestReviews, latestPosts] = await Promise.all([
      this.getProductsForYou(userId, bestSellerIds, 4, genderFilter),
      this.getLatestReviews(30),
      this.getLatestPosts(3),
    ]);

    return {
      success: true,
      data: {
        bestSellerProducts,
        productsForYou,
        latestReviews,
        latestPosts,
      },
      message: null,
    };
  }

  private buildHomeProductGenderFilter(gender?: string) {
    if (gender === "MALE") {
      return { in: [Gender.MALE, Gender.UNISEX] };
    }
    if (gender === "FEMALE") {
      return { in: [Gender.FEMALE, Gender.UNISEX] };
    }
    return undefined;
  }

  private getProductInclude() {
    return {
      brand: {
        select: { name: true, slug: true },
      },
      variants: {
        where: {
          isActive: true,
          deletedAt: null,
          isPrimary: true,
        },
        take: 1,
        select: {
          stock: true,
          reserved: true,
          price: true,
          discount: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { path: true },
          },
        },
      },
    };
  }

  private async getBestSellerProducts(limit: number, genderFilter: any) {
    const sales = await prisma.inventory.groupBy({
      by: ["productVariantId"],
      where: {
        type: InventoryType.SALE,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit * 5, // Take more to account for filtering products/variants later
    });

    const variantIds = sales.map((s) => s.productVariantId);

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        gender: genderFilter,
        variants: {
          some: {
            id: { in: variantIds },
            isActive: true,
            deletedAt: null,
          },
        },
      },
      include: this.getProductInclude(),
      take: limit,
    });

    return products;
  }

  private async getProductsForYou(
    userId: string | number | undefined,
    excludeIds: number[],
    limit: number,
    genderFilter: any
  ) {
    const uid = userId ? Number(userId) : undefined;

    if (!uid) {
      return this.getTopRatedProducts(excludeIds, limit, genderFilter);
    }

    // Personalization logic for logged-in user
    const [orders, wishlist] = await Promise.all([
      prisma.order.findMany({
        where: { userId: uid },
        include: {
          orderItems: {
            include: {
              productVariant: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10
      }),
      prisma.productWishlist.findMany({
        where: { userId: uid },
        include: { product: true },
      }),
    ]);

    const mergedProductIds = new Set<number>();
    const mergedBrandIds = new Set<number>();

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.productVariant.product) {
          mergedProductIds.add(item.productVariant.product.id);
          mergedBrandIds.add(item.productVariant.product.brandId);
        }
      });
    });

    wishlist.forEach((item) => {
      if (item.product) {
        mergedProductIds.add(item.product.id);
        mergedBrandIds.add(item.product.brandId);
      }
    });

    const pIds = Array.from(mergedProductIds);
    const bIds = Array.from(mergedBrandIds);

    let products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        id: { notIn: [...excludeIds, ...pIds] },
        brandId: { in: bIds },
        gender: genderFilter,
        variants: {
          some: { isActive: true, deletedAt: null },
        },
      },
      take: limit,
      include: this.getProductInclude(),
    });

    if (products.length < limit) {
      const currentIds = products.map((p) => p.id);
      const remaining = limit - products.length;
      const fillProducts = await this.getTopRatedProducts(
        [...excludeIds, ...currentIds],
        remaining,
        genderFilter
      );
      products = [...products, ...fillProducts];
    }

    return products;
  }

  private async getTopRatedProducts(
    excludeIds: number[],
    limit: number,
    genderFilter: any
  ) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        id: { notIn: excludeIds },
        gender: genderFilter,
        variants: {
          some: { isActive: true, deletedAt: null },
        },
      },
      orderBy: [{ rating: "desc" }, { ratingCount: "desc" }],
      take: limit,
      include: this.getProductInclude(),
    });
  }

  private async getLatestReviews(limit: number) {
    const reviews = await prisma.review.findMany({
      where: {
        isPublish: true,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return reviews;
  }

  private async getLatestPosts(limit: number) {
    const posts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        deletedAt: null,
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return posts;
  }
}

