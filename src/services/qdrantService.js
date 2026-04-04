// src/services/qdrantService.js

/**
 * Data Mentah Tren AI (Simulasi Crawling/Doku/SOSMED)
 * Menambahkan lebih banyak variasi data untuk akurasi matching.
 */
const RAW_TRENDS = {
  food: [
    {
      id: 'f1',
      title: 'Seafood Platter Viral',
      description: 'Lagi ramai di TikTok, perpaduan lobster dan saus Padang melimpah.',
      keywords: ['seafood', 'lobster', 'udang', 'kepiting', 'ikan', 'sate seafood'],
      image: 'https://images.unsplash.com/photo-1559740038-f95bab91acc1?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/seafoodviral',
    },
    {
      id: 'f2',
      title: 'Wagyu Steak Low Budget',
      description: 'Tren makan steak wagyu dengan harga miring di pinggir jalan.',
      keywords: ['steak', 'daging', 'sapi', 'wagyu', 'bbq', 'daging sapi'],
      image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/steakviral/',
    },
    {
      id: 'f3',
      title: 'Seblak Prasmanan Pedas',
      description: 'Tren seblak dengan topping bebas pilih yang meluap di Bandung.',
      keywords: ['seblak', 'pedas', 'kerupuk', 'level', 'hot'],
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/seblakprasmanan',
    }
  ],
  drink: [
    {
      id: 'd1',
      title: 'Es Teh Jumbo 3000',
      description: 'Segarnya es teh dengan porsi raksasa yang hits di mana-mana.',
      keywords: ['teh', 'es', 'jumbo', 'segar', 'minum', 'tea'],
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=es+teh+jumbo+viral',
    },
    {
      id: 'd2',
      title: 'Dirty Matcha Latte',
      description: 'Kombinasi matcha premium dengan shot espresso lumer.',
      keywords: ['matcha', 'kopi', 'greentea', 'latte', 'susu'],
      image: 'https://images.unsplash.com/photo-1515824918246-a8a042ba2466?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/matchalatte/',
    },
    {
      id: 'd3',
      title: 'Kopi Susu Gula Aren 2.0',
      description: 'Varian baru kopi susu dengan tambahan topping salt cream.',
      keywords: ['kopi', 'susu', 'coffee', 'latte', 'aren'],
      image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/kopisusu/',
    }
  ],
  snack: [
    {
      id: 's1',
      title: 'Cheese Roll Lumer',
      description: 'Cemilan keju gulung dengan topping cokelat yang viral di TikTok.',
      keywords: ['cheese', 'keju', 'roll', 'pastry', 'cokelat', 'manis'],
      image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/cheeseroll',
    },
    {
      id: 's2',
      title: 'Cromboloni Crunchy',
      description: 'Pastry renyah yang sempat antre panjang di berbagai kota.',
      keywords: ['pastry', 'cromboloni', 'manis', 'kue', 'roti'],
      image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/cromboloni',
    },
    {
      id: 's3',
      title: 'Tahu Bulat Pedas Jeruk',
      description: 'Camilan klasik yang naik level dengan bumbu daun jeruk pedas.',
      keywords: ['tahu', 'pedas', 'camilan', 'jajanan', 'snack'],
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=tahu+bulat+viral',
    }
  ]
};

/**
 * Mencari kecocokan antara tren dengan menu yang tersedia
 */
const findBestMatch = (trend, menuItems) => {
  if (!menuItems || menuItems.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  menuItems.forEach(item => {
    let score = 0;
    const itemName = item.name?.toLowerCase() || '';
    const itemDesc = item.description?.toLowerCase() || '';
    const itemCat  = item.category?.toLowerCase() || '';

    // Cek kecocokan keyword
    trend.keywords.forEach(keyword => {
      const k = keyword.toLowerCase();
      if (itemName === k) score += 50; // Exact match nama
      else if (itemName.includes(k)) score += 30;
      
      if (itemDesc.includes(k)) score += 15;
    });

    // Bonus Kategori (Wajib Cocok untuk Akurasi)
    if (trend.id.startsWith('f') && (itemCat.includes('makanan') || itemCat.includes('utama'))) score += 20;
    if (trend.id.startsWith('d') && (itemCat.includes('minuman') || itemCat.includes('drink'))) score += 40; // Strict untuk minuman
    if (trend.id.startsWith('s') && (itemCat.includes('snack') || itemCat.includes('jajanan') || itemCat.includes('cemilan'))) score += 40;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { 
        ...item, 
        matchScore: Math.min(score, 99) 
      };
    }
  });

  return highestScore > 15 ? bestMatch : null;
};

/**
 * Mengambil tren AI dengan pengacakan (Shuffle)
 */
export const fetchAITrends = async (category = 'food', menuItems = []) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let trends = [...(RAW_TRENDS[category] || [])];
      
      // Shuffle trends agar selalu beda
      trends = trends.sort(() => Math.random() - 0.5);

      const enrichedTrends = trends.map(trend => {
        const matchedMenu = findBestMatch(trend, menuItems);
        return {
          ...trend,
          matchedMenu: matchedMenu,
          matchScore: matchedMenu ? matchedMenu.matchScore : 0
        };
      });
      resolve(enrichedTrends);
    }, 800);
  });
};

/**
 * Mencari info viral untuk menu tertentu (Untuk Halaman Detail)
 */
export const getViralInfoForMenuItem = (menuItem, menuItems = []) => {
  if (!menuItem) return null;

  const allTrends = [
    ...RAW_TRENDS.food,
    ...RAW_TRENDS.drink,
    ...RAW_TRENDS.snack
  ];

  let bestTrend = null;
  let highestScore = 0;

  allTrends.forEach(trend => {
    let score = 0;
    const itemName = menuItem.name?.toLowerCase() || '';
    const itemDesc = menuItem.description?.toLowerCase() || '';

    trend.keywords.forEach(keyword => {
      const k = keyword.toLowerCase();
      if (itemName.includes(k)) score += 30;
      if (itemDesc.includes(k)) score += 10;
    });

    if (score > highestScore) {
      highestScore = score;
      bestTrend = trend;
    }
  });

  return highestScore > 10 ? bestTrend : null;
};
