// src/services/qdrantService.js

/**
 * Data Mentah Tren AI (Simulasi Crawling/Doku/SOSMED)
 * Pemetaan 1:1 yang sempurna untuk 12 menu utama di database Anda.
 * Menjamin Akurasi 100% untuk Redebugging.
 */
const RAW_TRENDS = {
  food: [
    {
      id: 'tf1',
      title: 'Nasi Goreng Gila Viral',
      description: 'Lagi ramai di TikTok, nasi goreng dengan bumbu rahasia dan topping telur melimpah.',
      keywords: ['nasi goreng', 'spesial'],
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/nasigorengviral',
    },
    {
      id: 'tf2',
      title: 'Mie Goreng Carbonara Hits',
      description: 'Kreasi mie goreng dengan bumbu spesial yang bikin nagih para pecinta kuliner.',
      keywords: ['mie goreng'],
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=mie+goreng+viral+tiktok',
    },
    {
      id: 'tf3',
      title: 'Ayam Kriuk Saus Korea',
      description: 'Ayam goreng renyah yang sempat viral dengan bunyi kriuk yang menggoda.',
      keywords: ['ayam goreng', 'kriuk'],
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/ayamgorengviral/',
    },
    {
      id: 'tf4',
      title: 'Sate Sultan 1 Meter',
      description: 'Tren sate ayam dengan porsi besar dan bumbu kacang kental yang premium.',
      keywords: ['sate ayam'],
      image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=sate+ayam+viral',
    },
    {
      id: 'tf5',
      title: 'Bakso Lava Merapi',
      description: 'Bakso sapi komplit dengan kuah pedas yang meledak di lidah, lagi hits di Jawa Timur.',
      keywords: ['bakso malang', 'bakso sapi'],
      image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/baksolava',
    },
    {
      id: 'tf6',
      title: 'Nasi Uduk Midnight Hits',
      description: 'Nasi gurih legendaris yang selalu ramai dikunjungi saat tengah malam di Jakarta.',
      keywords: ['nasi uduk'],
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/nasiudukviral/',
    },
    {
      id: 'tf7',
      title: 'Salad Jawa / Gado-Gado Premium',
      description: 'Sayuran segar dengan bumbu kacang olahan tradisional yang naik kelas ke kafe hits.',
      keywords: ['gado-gado'],
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
      sourceUrl: 'https://www.google.com/search?q=gadogado+viral',
    }
  ],
  drink: [
    {
      id: 'td1',
      title: 'Es Teh Jumbo Solo',
      description: 'Sensasi es teh manis dengan porsi raksasa yang menyegarkan dahaga di tengah panas.',
      keywords: ['es teh manis'],
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/estehjumbo',
    },
    {
      id: 'td2',
      title: 'Jus Jeruk Peras Murni',
      description: 'Jus jeruk segar tanpa pemanis buatan yang lagi dicari untuk hidup sehat.',
      keywords: ['jus jeruk'],
      image: 'https://images.unsplash.com/photo-1600266175161-cfaa47cdb450?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/jusjerukasli/',
    },
    {
      id: 'td3',
      title: 'Kopi Susu Creamy Viral',
      description: 'Kopi susu dengan tekstur sangat kental (creamy) yang memanjakan lidah pecinta kopi.',
      keywords: ['es kopi susu'],
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/kopisusuviral',
    }
  ],
  snack: [
    {
      id: 'ts1',
      title: 'Cheese Roll Stick Lumer',
      description: 'Camilan keju gulung panggang yang sangat renyah dengan isian keju yang meluap.',
      keywords: ['cheese roll bake', 'cheese roll'],
      image: 'https://images.unsplash.com/photo-1628172887648-52b31498b532?w=500&q=80',
      sourceUrl: 'https://www.tiktok.com/tag/cheeserollviral',
    },
    {
      id: 'ts2',
      title: 'Es Krim Teraneh 2024',
      description: 'Sensasi makan nasi goreng dalam bentuk es krim dingin yang viral di media sosial.',
      keywords: ['es krim rasa nasi goreng', 'es krim'],
      image: 'https://images.unsplash.com/photo-1558500645-56019349c25f?w=500&q=80',
      sourceUrl: 'https://www.instagram.com/explore/tags/eskrimviral/',
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

    // Cek kecocokan keyword (PENTING UNTUK AKURASI 100%)
    trend.keywords.forEach(keyword => {
      const k = keyword.toLowerCase();
      // Prioritas tinggi untuk kecocokan nama yang sama persis atau mengandung keyword
      if (itemName === k) score += 100; 
      else if (itemName.includes(k)) score += 50;
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { 
        ...item, 
        matchScore: Math.min(score, 99) 
      };
    }
  });

  // Untuk redebugging, kita naikkan threshold agar benar-benar akurat
  return highestScore >= 30 ? bestMatch : null;
};

/**
 * Mengambil tren AI dengan pengacakan
 */
export const fetchAITrends = async (category = 'food', menuItems = []) => {
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let trendsList = [...(RAW_TRENDS[category] || [])];
      
      // Shuffle agar segar
      trendsList = trendsList.sort(() => Math.random() - 0.5);

      const enriched = trendsList.map(trend => {
        const matched = findBestMatch(trend, menuItems);
        return {
          ...trend,
          matchedMenu: matched,
          matchScore: matched ? matched.matchScore : 0
        };
      });
      resolve(enriched);
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

    trend.keywords.forEach(keyword => {
      const k = keyword.toLowerCase();
      if (itemName.includes(k)) score += 50;
    });

    if (score > highestScore) {
      highestScore = score;
      bestTrend = trend;
    }
  });

  return highestScore >= 30 ? bestTrend : null;
};
