export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  imageSrc?: string
  tags?: string[]
  spicyLevel?: 0 | 1 | 2 | 3
}

export type MenuCategory = {
  id: string
  name: string
  items: MenuItem[]
}

export type RestaurantMenu = {
  categories: MenuCategory[]
}

export const FOOD_PLACEHOLDER_IMAGES: string[] = [
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.10.44 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.12.46 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.15.37 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.18.54 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.20.16 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.22.56 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.27.11 AM (1).jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-07 at 6.27.11 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 4.00.15 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 4.10.08 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 4.10.09 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 4.10.10 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 4.10.11 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 4.10.12 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 5.33.24 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 5.39.21 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 5.42.53 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 5.45.39 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 5.48.46 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 5.57.28 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.01.35 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.04.07 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.06.54 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.08.42 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.13.15 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.14.34 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.23.11 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.25.46 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.27.52 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.30.04 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.34.19 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.37.50 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.40.46 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 6.42.45 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.21.59 AM (1).jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.21.59 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.22.00 AM (1).jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.22.00 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.25.53 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.29.49 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.29.50 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.38.27 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.39.01 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.39.02 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.54.48 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 7.54.49 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 8.08.21 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 8.08.22 AM (1).jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 8.08.22 AM.jpeg',
  '/images/placeholders/WhatsApp Image 2025-09-12 at 8.10.17 AM.jpeg',
]

export const DEFAULT_MENU: RestaurantMenu = {
  categories: [
    {
      id: 'signature',
      name: 'Signature',
      items: [
        {
          id: 'sig-biryani',
          name: 'Grand Azure Chicken Biryani',
          description: 'Aromatic basmati, saffron notes, raita & salad.',
          price: 1850,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 7.29.49 AM.jpeg',
          tags: ['Chef Special'],
          spicyLevel: 2,
        },
        {
          id: 'sig-steak',
          name: 'Grilled Ribeye (300g)',
          description: 'Char-grilled ribeye with pepper sauce & seasonal vegetables.',
          price: 6200,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 6.27.52 AM.jpeg',
          tags: ['Premium'],
          spicyLevel: 0,
        },
        {
          id: 'sig-platter',
          name: 'Grand Azure Mixed Grill Platter',
          description: 'Seekh kebab, malai boti, chicken tikka, fries & sauces.',
          price: 5200,
          tags: ['Sharing'],
          spicyLevel: 2,
        },
        {
          id: 'sig-seafood',
          name: 'Pan-Seared Fish with Lemon Butter',
          description: 'Seasonal catch, herb rice, citrus beurre blanc.',
          price: 4800,
          tags: ['Chef Special'],
          spicyLevel: 0,
        },
      ],
    },
    {
      id: 'starters',
      name: 'Starters',
      items: [
        {
          id: 'st-soup',
          name: 'Cream of Mushroom Soup',
          description: 'Velvety mushroom broth with herbs and cream.',
          price: 950,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 6.01.35 AM.jpeg',
          tags: ['Vegetarian'],
          spicyLevel: 0,
        },
        {
          id: 'st-wings',
          name: 'Smoked BBQ Wings',
          description: 'House BBQ glaze, served with garlic dip.',
          price: 1450,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 6.25.46 AM.jpeg',
          tags: ['Popular'],
          spicyLevel: 1,
        },
        {
          id: 'st-dynamite',
          name: 'Dynamite Prawns',
          description: 'Crispy prawns, creamy dynamite sauce, sesame.',
          price: 2350,
          tags: ['Popular'],
          spicyLevel: 2,
        },
        {
          id: 'st-samosa',
          name: 'Mini Chicken Samosa (6 pcs)',
          description: 'Crispy golden pastry, mint chutney.',
          price: 750,
          tags: ['Snack'],
          spicyLevel: 1,
        },
      ],
    },
    {
      id: 'mains',
      name: 'Mains',
      items: [
        {
          id: 'mn-karahi',
          name: 'Chicken Karahi (Boneless)',
          description: 'Tomato, ginger, green chili — classic Pakistani style.',
          price: 2950,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-07 at 6.27.11 AM.jpeg',
          tags: ['Desi'],
          spicyLevel: 3,
        },
        {
          id: 'mn-pasta',
          name: 'Penne Alfredo',
          description: 'Creamy parmesan sauce, mushrooms, and garlic butter.',
          price: 2100,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 6.34.19 AM.jpeg',
          tags: ['Comfort'],
          spicyLevel: 0,
        },
        {
          id: 'mn-handi',
          name: 'Makhni Handi',
          description: 'Creamy tomato gravy, tender chicken, butter finish.',
          price: 3150,
          tags: ['Desi'],
          spicyLevel: 2,
        },
        {
          id: 'mn-bbq',
          name: 'Chicken Tikka (2 pcs)',
          description: 'Charcoal grilled, served with naan & chutney.',
          price: 1650,
          tags: ['BBQ'],
          spicyLevel: 2,
        },
        {
          id: 'mn-burger',
          name: 'Wagyu Style Beef Burger',
          description: 'Smash patty, cheddar, caramelized onion, fries.',
          price: 2400,
          tags: ['Popular'],
          spicyLevel: 0,
        },
      ],
    },
    {
      id: 'desserts',
      name: 'Desserts',
      items: [
        {
          id: 'ds-lava',
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate center with vanilla ice cream.',
          price: 1200,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 7.39.01 AM.jpeg',
          tags: ['Sweet'],
          spicyLevel: 0,
        },
        {
          id: 'ds-kheer',
          name: 'Saffron Kheer',
          description: 'Traditional rice pudding with pistachio & saffron.',
          price: 900,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 5.57.28 AM.jpeg',
          tags: ['Classic'],
          spicyLevel: 0,
        },
        {
          id: 'ds-cheesecake',
          name: 'Baked Cheesecake',
          description: 'Creamy vanilla cheesecake, berry compote.',
          price: 1350,
          tags: ['Premium'],
          spicyLevel: 0,
        },
        {
          id: 'ds-brownie',
          name: 'Fudge Brownie Sundae',
          description: 'Warm brownie, vanilla ice cream, chocolate sauce.',
          price: 1250,
          tags: ['Sweet'],
          spicyLevel: 0,
        },
      ],
    },
    {
      id: 'beverages',
      name: 'Beverages',
      items: [
        {
          id: 'bv-mint',
          name: 'Mint Margarita',
          description: 'Fresh mint, lemon, soda — signature refresher.',
          price: 650,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-07 at 6.10.44 AM.jpeg',
          tags: ['Refreshing'],
          spicyLevel: 0,
        },
        {
          id: 'bv-coffee',
          name: 'Cappuccino',
          description: 'Espresso with steamed milk foam.',
          price: 700,
          imageSrc: '/images/placeholders/WhatsApp Image 2025-09-12 at 4.10.11 AM.jpeg',
          tags: ['Coffee'],
          spicyLevel: 0,
        },
        {
          id: 'bv-iced',
          name: 'Iced Latte',
          description: 'Chilled espresso, milk, and light vanilla.',
          price: 850,
          tags: ['Coffee'],
          spicyLevel: 0,
        },
        {
          id: 'bv-mocktail',
          name: 'Azure Sunset Mocktail',
          description: 'Citrus, pineapple, grenadine, soda — signature blend.',
          price: 950,
          tags: ['Signature'],
          spicyLevel: 0,
        },
      ],
    },
  ],
}

