import { Concentration, Gender } from "@prisma/client";

export const brands = [
  { name: "Versace", slug: "versace" },
  { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier" },
  { name: "Tom Ford", slug: "tom-ford" },
  { name: "Yves Saint Laurent", slug: "ysl" },
  { name: "Lancome", slug: "lancome" },
  { name: "Carolina Herrera", slug: "carolina-herrera" },
  { name: "Dior", slug: "dior" },
  { name: "Giorgio Armani", slug: "giorgio-armani" },
  { name: "Calvin Klein", slug: "calvin-klein" },
  { name: "Maison Francis Kurkdjian", slug: "maison-francis-kurkdjian" },
  { name: "Le Labo", slug: "le-labo" },
  { name: "Chanel", slug: "chanel" },
  { name: "Roja Parfums", slug: "roja-parfums" },
];

export const categories = [
  { name: "Guide", slug: "guide" },
  { name: "Trends", slug: "trends" },
  { name: "Tips", slug: "tips" },
  { name: "History", slug: "history" },
];

export const products = [
  {
    name: "Miss Dior",
    brandSlug: "dior",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "A colorful floral 'millefiori' scent with Centifolia rose, peony, and iris notes.",
    releasedYear: 2021,
    variants: [
      {
        size: 100,
        price: 680000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://cdn.salla.sa/onxjbX/08d33866-d38a-40aa-b863-f1097f2ccc84-1000x1000-lrAsVE6XqDdSSgb7hLIiyIHV30hFqMYxcphyDQCe.png",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "J'adore",
    brandSlug: "dior",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "An iconic, opulent floral bouquet of Ylang-Ylang, Damascus Rose, and Jasmine.",
    releasedYear: 1999,
    variants: [
      {
        size: 100,
        price: 650000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://down-my.img.susercontent.com/file/my-11134207-7rasm-m7u88g1d7an292",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Libre",
    brandSlug: "ysl",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "The fragrance of freedom, blending Moroccan orange blossom with French lavender.",
    releasedYear: 2019,
    variants: [
      {
        size: 90,
        price: 620000,
        discount: 0,
        stock: 20,
        images: [
          {
            path: "https://isetankl.com.my/cdn/shop/files/ysl-beauty-fragrance-libre-eau-de-parfum-4.jpg?v=1762930235&width=1800",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Black Opium",
    brandSlug: "ysl",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "A captivating and energizing scent with notes of black coffee, white florals, and vanilla.",
    releasedYear: 2014,
    variants: [
      {
        size: 90,
        price: 580000,
        discount: 0,
        stock: 18,
        images: [
          {
            path: "https://fragrancemyra.com/wp-content/uploads/2022/01/p394534-av-01-zoom.jpg",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },

  // 5 Pure Male Perfumes
  {
    name: "Y Eau de Parfum",
    brandSlug: "ysl",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description: "A bold and sophisticated fragrance with fresh bergamot, ginger, and sage.",
    releasedYear: 2018,
    variants: [
      {
        size: 100,
        price: 520000,
        discount: 0,
        stock: 25,
        images: [
          {
            path: "https://isetankl.com.my/cdn/shop/files/ysl-beauty-fragrance-y-eau-de-parfum-intense-4.jpg?v=1716191681&width=1080",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Acqua di Giò Profondo",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description: "A deep, marine intensity with notes of green mandarin and mineral essences.",
    releasedYear: 2020,
    variants: [
      {
        size: 100,
        price: 480000,
        discount: 0,
        stock: 10,
        images: [
          {
            path: "https://www.giorgioarmanibeauty.com.au/on/demandware.static/-/Sites-armani-au-ng-Library/en_AU/dw8b1989ff/images/pdp/ww-00846-arm/ww-00846-arm-adg-parfum-comparison-visual.jpg",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Stronger With You",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description: "A warm, spicy fragrance with notes of cardamom, pink pepper, and smoky vanilla.",
    releasedYear: 2017,
    variants: [
      {
        size: 100,
        price: 430000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.stylishop.com/cdn-cgi/image/format=avif/media/catalog/product/2910504043/images/2910504043_3.jpg?v=1",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "CK One",
    brandSlug: "calvin-klein",
    concentration: Concentration.EDT,
    gender: Gender.UNISEX, // Although requested in male section, CK One is historically the iconic unisex
    description: "The original clean and fresh scent that defines shared fragrance with green tea and citrus.",
    releasedYear: 1994,
    variants: [
      {
        size: 100,
        price: 220000,
        discount: 0,
        stock: 30,
        images: [
          {
            path: "https://static.sweetcare.com/img/prd/488/v-638606237710856005/calvin-klein-011598ck-1.webp",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "L'Homme",
    brandSlug: "ysl",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description: "A woody floral musk fragrance with ginger, bergamot, and cedar.",
    releasedYear: 2006,
    variants: [
      {
        size: 100,
        price: 410000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://perfumedubai.com/cdn/shop/files/63_d77e8b6e-246e-4166-93af-0a29fb7faaab_460x@2x.png?v=1741505017",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },

  // 2 Unisex Perfumes
  {
    name: "Baccarat Rouge 540",
    brandSlug: "maison-francis-kurkdjian",
    concentration: Concentration.EDP,
    gender: Gender.UNISEX,
    description: "A highly concentrated, sophisticated scent with woody, amber, and jasmine accords.",
    releasedYear: 2015,
    variants: [
      {
        size: 70,
        price: 1250000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://osswald.ch/cdn/shop/files/baccarat_rouge_540_eau_de_parfum.jpg?v=1764944383",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Santal 33",
    brandSlug: "le-labo",
    concentration: Concentration.EDP,
    gender: Gender.UNISEX,
    description: "A woody aromatic fragrance that evokes the spirit of the American West with sandalwood and leather.",
    releasedYear: 2011,
    variants: [
      {
        size: 100,
        price: 1100000,
        discount: 0,
        stock: 7,
        images: [
          {
            path: "https://almaycasa.co.il/cdn/shop/files/LE_LABO_Santal_33_100ml_EDP_Take_App_03.jpg?v=1732991153",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Acqua di Giò Pour Homme",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDT,
    gender: Gender.MALE,
    description: "A classic aquatic fragrance that opens with a splash of fresh, calabrian bergamot, neroli and green tangerine.",
    releasedYear: 1996,
    variants: [
      {
        size: 100,
        price: 450000,
        discount: 0,
        stock: 10,
        images: [
          {
            path: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Chanel N°5",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "The essence of femininity. A powdery floral bouquet housed in an iconic bottle with a minimalist design.",
    releasedYear: 1921,
    variants: [
      {
        size: 100,
        price: 650000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Coco Chanel",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "A spicy, floral fragrance that reveals the contrasting notes of the ambery spirit. Intense and baroque.",
    releasedYear: 1984,
    variants: [
      {
        size: 100,
        price: 600000,
        discount: 0,
        stock: 8,
        images: [
          {
            path: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Coco Noir",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "The magnetic and uncompromising modern ambery fragrance with luminous notes of May Rose and Geranium leaf.",
    releasedYear: 2012,
    variants: [
      {
        size: 100,
        price: 680000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Coco Mademoiselle",
    brandSlug: "chanel",
    concentration: Concentration.EDP,
    gender: Gender.FEMALE,
    description: "A vibrant, voluptuous ambery-fresh fragrance. Sparks of orange lead to a clear heart of May Rose and Jasmine.",
    releasedYear: 2001,
    variants: [
      {
        size: 100,
        price: 650000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Apex Eau Intense",
    brandSlug: "roja-parfums",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description: "A fresh and powerful chypré scent with vibrant citrus, pineapple, and deep woody notes of fir balsam and sandalwood.",
    releasedYear: 2023,
    variants: [
      {
        size: 100,
        price: 1350000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://scentira.in/cdn/shop/files/Roja_Apex_Eau_Intense_Eau_de_Parfum_4_dd78085a-e13e-4607-9e5f-1ea612b6820c.png?v=1758360447&width=1000",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Elysium Pour Homme",
    brandSlug: "roja-parfums",
    concentration: Concentration.PARFUM,
    gender: Gender.MALE,
    description: "An ultra-fresh citrus blend of lemon, bergamot, and lime, anchored by rich ambergris and leather.",
    releasedYear: 2017,
    variants: [
      {
        size: 100,
        price: 1150000,
        discount: 0,
        stock: 8,
        images: [
          {
            path: "https://www.myperfumeshop.qa/cdn/shop/files/roja-parfums-elysium-pour-homme-edp-perfume-cologne-977788.webp?v=1741712220&width=800",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Versace Eros Energy",
    brandSlug: "versace",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description: "A high-energy flanker of the Eros line, featuring a burst of citrus notes like blood orange and lime with a woody base.",
    releasedYear: 2024,
    variants: [
      {
        size: 100,
        price: 520000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://img01.ztat.net/article/spp-media-p1/9b0bfc5379bc454ca0dff8cff7b29c02/32df744fad644eeb8409dffa5d0d34a6.jpg?imwidth=762",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
   {
    name: "Acqua di Giò Eau de Parfum",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description: "A long-lasting masculine fragrance where the infinite spirit of the sea meets a powerful green mandarin opening. Clary sage and lavender provide a sophisticated aromatic heart, while sustainably sourced patchouli leaves a warm, mineral trail on the skin.",
    releasedYear: 2024,
    variants: [
      {
        size: 100,
        price: 550000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://www.dumyah.com/image/cache/data/2025/09/17567103481595140817-800x800.webp",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Acqua di Giò Profondo Eau de Parfum",
    brandSlug: "giorgio-armani",
    concentration: Concentration.EDP,
    gender: Gender.MALE,
    description: "Plunge into the deep blue with this intense marine interpretation of the original classic. It opens with salty aquatic notes and bergamot, evolving into an aromatic blend of rosemary and cypress, eventually settling into a profound base of mineral amber and musk.",
    releasedYear: 2020,
    variants: [
      {
        size: 100,
        price: 480000,
        discount: 0,
        stock: 10,
        images: [
          {
            path: "https://media.parfumo.com/user_imagery/41/41_bf3286d5ee6f2ccfabb7f853c115fb937662a111_1200.jpg",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
  },
  {
    name: "Acqua di Giò Profondo Parfum",
    brandSlug: "giorgio-armani",
    concentration: Concentration.PARFUM,
    gender: Gender.MALE,
    description: "An even more mysterious and addictive intensity that captures the absolute depth of the ocean. This parfum concentration amplifies the signature marine notes with a unique balsamic cistus and a mineral salty accord, creating a magnetic and enduring scent profile.",
    releasedYear: 2024,
    variants: [
      {
        size: 100,
        price: 680000,
        discount: 0,
        stock: 12,
        images: [
          {
            path: "https://static.thcdn.com/productimg/original/14605837-1745104066168608.jpg",
            isPrimary: true,
            order: 0
          }
        ]
      }
    ]
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
        price: 150000,
        discount: 0,
        stock: 5,
        images: [
          {
            path: "https://i.ebayimg.com/images/g/FRoAAOSwi0Nksjsk/s-l1200.jpg",
            isPrimary: true,
            order: 0
          },
          {
            path: "https://u-mercari-images.mercdn.net/photos/m41866060093_1.jpg?width=2560&quality=75&_=1706535162",
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
            path: "https://fandi-perfume.com/cdn/shop/files/versace-bright-crystal-absolu-for-women-eau-de-parfum-1217974189.png?v=1769518349&width=1024",
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
            path: "https://images.tcdn.com.br/img/img_prod/1251682/jean_paul_gaultier_le_male_edt_1317_2_f6b8ae36447e58a7fc5f52a5d3c7b84c.jpg",
            isPrimary: true,
            order: 0
          },
          {
            path: "https://static.beautytocare.com/cdn-cgi/image/width=1600,height=1600,f=auto/media/catalog/product//j/e/jean-paul-gaultier-le-male-eau-de-toilette-40ml_1.jpg",
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
        size: 50,
        price: 1400000,
        discount: 0,
        stock: 15,
        images: [
          {
            path: "https://down-tw.img.susercontent.com/file/971feba3a4be41d06103fb508e36c589",
            isPrimary: true,
            order: 0
          },
        ]
      },
      {
        size: 30,
        price: 880000,
        discount: 0,
        stock: 50,
        images: [
          {
            path: "https://a.cdnsbn.com/images/products/xl/26066398006.jpg",
            isPrimary: false,
            order: 0
          },
          {
            path: "https://cdn.idealo.com/folder/Product/200736/4/200736492/s3_produktbild_max_5/tom-ford-lost-cherry-eau-parfum-30ml.jpg",
            isPrimary: true,
            order: 1
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
          // {
          //   path: "https://cdn.paris-avenues.com/image/cache/catalog/Product2/8011003809202-Versace-Eros-EDT-50-Ml--1000x1000.jpg",
          //   isPrimary: true,
          //   order: 0
          // },
          {
            path: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
            isPrimary: true,
            order: 0
          },
        ],
      },
    ],
  },
];

export const posts = [
  {
    title: "The Art of Layering Fragrances: A Complete Guide",
    excerpt: "Discover how to combine multiple perfumes to create your own unique signature scent. Learn the techniques used by professional perfumers.",
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
    categorySlug: "guide",
    content:
      "Fragrance layering is an art form that allows you to create a personalized scent that's uniquely yours. By combining different perfumes strategically, you can achieve a complexity and depth that single fragrances often can't provide.<br/><br/>" +
      "<h2>Understanding Fragrance Families</h2><br/>" +
      "Before you start layering, it's essential to understand the basic fragrance families:<br/>" +
      "<ul>" +
      "<li><strong>Citrus</strong>: Fresh, bright, and energizing</li>" +
      "<li><strong>Floral</strong>: Romantic, feminine, and elegant</li>" +
      "<li><strong>Oriental</strong>: Warm, sensual, and exotic</li>" +
      "<li><strong>Woody</strong>: Earthy, grounding, and sophisticated</li>" +
      "<li><strong>Fresh</strong>: Clean, aquatic, and invigorating</li>" +
      "</ul><br/>" +
      "<h2>Basic Layering Techniques</h2><br/>" +
      "<h3>1. Start with a Base</h3>" +
      "Begin with your heaviest, most long-lasting fragrance. This is typically an oriental or woody scent that will anchor your combination.<br/><br/>" +
      "<h3>2. Add Complementary Notes</h3>" +
      "Layer a lighter fragrance on top that shares at least one note with your base. This creates harmony between the scents.<br/><br/>" +
      "<h3>3. Apply Strategically</h3>" +
      "Apply different fragrances to different pulse points. Your base scent goes on your chest and wrists, while lighter scents can go behind your ears or in the crooks of your elbows.<br/><br/>" +
      "<h2>Tips for Success</h2><br/>" +
      "<ul>" +
      "<li>Start with just two fragrances before attempting more complex combinations</li>" +
      "<li>Test your combinations at home before wearing them out</li>" +
      "<li>Keep notes of successful combinations</li>" +
      "<li>Don't be afraid to experiment</li>" +
      "</ul><br/>" +
      "The beauty of layering is that there are no strict rules. Trust your nose and have fun creating something uniquely you.",
  },
  {
    title: "Top 10 Perfume Trends for 2024",
    excerpt: "From sustainable ingredients to nostalgic scents, explore the fragrance trends that are defining this year's perfume landscape.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    categorySlug: "trends",
    content:
      "The perfume industry is constantly evolving, and 2024 brings exciting new trends that reflect our changing world and values.<br/><br/>" +
      "<h2>1. Sustainable Luxury</h2>" +
      "Eco-conscious consumers are driving demand for perfumes made with sustainably sourced ingredients and recyclable packaging.<br/><br/>" +
      "<h2>2. Gender-Fluid Fragrances</h2>" +
      "The lines between masculine and feminine scents continue to blur, with more brands offering truly unisex options.<br/><br/>" +
      "<h2>3. Nostalgic Scents</h2>" +
      "Comforting, familiar scents that evoke memories are making a strong comeback, from fresh laundry to grandmother's kitchen.<br/><br/>" +
      "<h2>4. Wellness Fragrances</h2>" +
      "Perfumes designed to influence mood and promote well-being are increasingly popular.<br/><br/>" +
      "<h2>5. Rare Ingredients</h2>" +
      "Consumers are seeking out fragrances featuring unusual, hard-to-find ingredients for uniqueness.",
  },
  {
    title: "How to Make Your Perfume Last All Day",
    excerpt: "Expert tips and tricks to maximize the longevity of your favorite fragrances, from application techniques to storage solutions.",
    image: "https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=800&q=80",
    categorySlug: "tips",
    content:
      "Nothing is more frustrating than spraying on your favorite perfume only to have it fade within a few hours. Here's how to make your scent last from morning to night.<br/><br/>" +
      "<h2>Prep Your Skin</h2>" +
      "Moisturized skin holds fragrance better than dry skin. Apply an unscented lotion or body oil before your perfume.<br/><br/>" +
      "<h2>Target Pulse Points</h2>" +
      "Apply perfume to areas where blood vessels are close to the skin:<br/>" +
      "<ul>" +
      "<li>Wrists</li>" +
      "<li>Behind ears</li>" +
      "<li>Base of throat</li>" +
      "<li>Inside elbows</li>" +
      "<li>Behind knees</li>" +
      "</ul><br/>" +
      "<h2>Don't Rub</h2>" +
      "Rubbing your wrists together after applying perfume breaks down the molecules and causes the scent to fade faster.<br/><br/>" +
      "<h2>Layer Your Products</h2>" +
      "Use matching body wash, lotion, and perfume from the same line to build intensity.<br/><br/>" +
      "<h2>Store Properly</h2>" +
      "Keep your perfumes away from heat, light, and humidity. A cool, dark drawer is ideal.",
  },
  {
    title: "The History of Oud: From Ancient Arabia to Modern Perfumery",
    excerpt: "Explore the fascinating journey of oud, one of the world's most precious and sought-after fragrance ingredients.",
    image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800&q=80",
    categorySlug: "history",
    content:
      "Oud, also known as agarwood, has been treasured for thousands of years. This precious ingredient has a rich history that spans continents and cultures.<br/><br/>" +
      "<h2>Origins</h2>" +
      "Oud is derived from the Aquilaria tree, native to Southeast Asia. When the tree becomes infected with a specific type of mold, it produces a dark, fragrant resin as a defense mechanism.<br/><br/>" +
      "<h2>Cultural Significance</h2>" +
      "In the Middle East, oud has been burned as incense for millennia and is deeply woven into cultural and religious practices. It symbolizes luxury, hospitality, and spirituality.<br/><br/>" +
      "<h2>Modern Renaissance</h2>" +
      "While oud has always been popular in the Middle East, it only entered Western perfumery in the early 2000s. Today, it's one of the most sought-after ingredients in luxury fragrances.",
  },
  {
    title: "Perfume Gifting Guide: Finding the Perfect Scent",
    excerpt: "Choosing a perfume for someone else can be daunting. Here's your comprehensive guide to selecting a fragrance gift they'll love.",
    image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=800&q=80",
    categorySlug: "guide",
    content:
      "Gifting perfume can feel risky, but with the right approach, you can choose a fragrance that will delight your recipient.<br/><br/>" +
      "<h2>Know Their Preferences</h2>" +
      "Pay attention to:<br/>" +
      "<ul>" +
      "<li>Scents they already wear</li>" +
      "<li>Their personality and lifestyle</li>" +
      "<li>Seasons they prefer certain scents</li>" +
      "</ul><br/>" +
      "<h2>Safe Choices</h2>" +
      "When in doubt, consider these universally appealing options:<br/>" +
      "<ul>" +
      "<li>Light florals for spring/summer</li>" +
      "<li>Warm vanillas for fall/winter</li>" +
      "<li>Fresh citrus for active lifestyles</li>" +
      "</ul><br/>" +
      "<h2>Presentation Matters</h2>" +
      "A beautifully packaged perfume with a handwritten note shows extra thought and care.",
  },
];
