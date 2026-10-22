// Updates all product pricing, HSN codes, GST rates, and pack sizes from the
// client's official 4-page price sheet (Oct 2026).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Dynamically import db
const { db, connectDB } = await import(pathToFileURL(path.join(rootDir, 'server', 'db.js')).href);
await connectDB();

// 1. First make a full timestamped backup of current products in MongoDB
const currentProducts = await db.getAllProductsRaw();
const backupPath = path.join(rootDir, 'port-notes', `live-products-backup-before-client-pricing-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(currentProducts, null, 2), 'utf8');
console.log(`✅ Backed up ${currentProducts.length} products to ${backupPath}`);

// Canonical list of all products from the client's PDF:
const clientData = [
  // Page 1
  {
    name: 'Shakthi Sarga Jelly Drip Gel',
    alias: ['Sarga Jelly – Drip Gel', 'Sarga Jelly', 'Sarga Jelly Drip Gel'],
    form: 'Gel',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 KG', price: 3999, mrp: 3999 }],
    image: '/assets/products/sarga-jelly.jpg',
    description: 'Shakthi Sarga Jelly Drip Gel is a specialized marine seaweed formulation designed for drip irrigation systems, delivering vital growth nutrients directly to root zones.'
  },
  {
    name: 'Shakthi Gold Gel',
    alias: ['Gold Gel'],
    form: 'Gel',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 KG', price: 2999, mrp: 2999 }],
    image: '/assets/products/gold-gel.jpg',
    description: 'Shakthi Gold Gel combines seaweed extract, potassium humate, and protein hydrolysate to support vigorous root establishment and complete plant vegetative development.'
  },
  {
    name: 'Gold Gel Pro',
    alias: ['Gold Gel Pro'],
    form: 'Gel',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 KG', price: 2999, mrp: 2999 }],
    image: '/assets/products/gold-gel.jpg',
    description: 'Gold Gel Pro is an advanced multi-functional bio-stimulant gel formulated for enhanced plant vigor and nutrient assimilation.'
  },
  {
    name: 'Gold Gel Pro - Coconut',
    alias: ['Gold Gel Pro – Coconut & Arecanut', 'Gold Gel Pro - Coconut & Arecanut'],
    form: 'Gel',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 KG', price: 3599, mrp: 3599 }],
    image: '/assets/products/gold-gel-pro-coconut.jpg',
    description: 'Tailored for coconut and arecanut palms to support vigorous root zone conditioning, inflorescence vigor, and button shedding reduction.'
  },
  {
    name: 'Gold Gel Pro - Banana',
    alias: ['Gold Gel Pro – Banana'],
    form: 'Gel',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 KG', price: 3999, mrp: 3999 }],
    image: '/assets/products/gold-gel-pro-banana.jpg',
    description: 'Specifically crafted for banana cultivation, supporting vegetative pseudostem girth, flower emergence, and uniform bunch filling.'
  },
  {
    name: 'Gold Gel Pro - Tapioca',
    alias: ['Gold Gel Pro – Tubers', 'Gold Gel Pro - Tubers'],
    form: 'Gel',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 KG', price: 3999, mrp: 3999 }],
    image: '/assets/products/gold-gel-pro-tubers.jpg',
    description: 'Formulated for tapioca and tuber crops, promoting starch accumulation, tuber enlargement, and uniform root expansion.'
  },
  {
    name: 'Salico-G',
    alias: ['Salico G', 'Salico-G'],
    form: 'Granules',
    category: 'Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '40 KG', price: 2499, mrp: 2499 }],
    image: '/assets/products/salico-g.jpg',
    description: 'Salico-G is a premium granular soil conditioner containing active seaweed bioactives that improve soil moisture retention and soil structure.'
  },
  {
    name: 'Shakthi Asco King -G',
    alias: ['Shakthi Asco King – G', 'Asco King - G'],
    form: 'Granules',
    category: 'Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [
      { size: '10 KG', price: 2399, mrp: 2399 },
      { size: '25 KG', price: 5999, mrp: 5999 }
    ],
    image: '/assets/products/shakthi-asco-king-g.jpg',
    description: 'Ascophyllum nodosum-based granular crop nutrition booster for prolonged soil fertility and improved micro-nutrient availability.'
  },
  {
    name: 'Shakthi Sampoorna Pro',
    alias: ['Shakthi Sampoorna – Pro', 'Shakthi Sampoorna Pro'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [
      { size: '500 ml', price: 699, mrp: 699 },
      { size: '5 ltr', price: 6499, mrp: 6499 }
    ],
    image: '/assets/products/shakthi-sampoorna-pro.jpg',
    description: 'Comprehensive liquid bio-stimulant offering balanced vegetative and reproductive support through natural plant-available amino acids.'
  },
  {
    name: 'Shakthi Akshaya Pro',
    alias: ['Shakthi Akshaya – Pro', 'Shakthi Akshaya Pro'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [
      { size: '500 ml', price: 699, mrp: 699 },
      { size: '5 ltr', price: 6499, mrp: 6499 }
    ],
    image: '/assets/products/shakthi-akshaya-pro.jpg',
    description: 'High-potency foliar liquid spray delivering energy reserves and bio-active molecules for stress resistance and foliage greening.'
  },
  {
    name: 'Shakthi Dayanutri Pro',
    alias: ['Shakthi Dayanutri – Pro', 'Shakthi Dayanutri Pro'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [
      { size: '500 ml', price: 699, mrp: 699 },
      { size: '5 ltr', price: 6499, mrp: 6499 }
    ],
    image: '/assets/products/shakthi-dayanutri-pro.jpg',
    description: 'Daily nutrient activator supporting cellular respiration and optimal chlorophyll synthesis across vegetable and fruit crops.'
  },

  // Page 2
  {
    name: 'Shakthi Banana Plus',
    alias: ['Shakthi Banana Plus'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [
      { size: '500 ml', price: 699, mrp: 699 },
      { size: '5 ltr', price: 6499, mrp: 6499 }
    ],
    image: '/assets/products/sb-01.jpg',
    description: 'Advanced banana crop nutrition formulation for robust bunch size, finger uniformity, and increased shelf-life.'
  },
  {
    name: 'Shakthi Coco Power RF',
    alias: ['Shakthi Coco Power RF'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 1199, mrp: 1199 }],
    image: '/assets/products/sb-02.jpg',
    description: 'Targeted root feeding formulation for coconut palms that revitalizes fibrous root systems and enhances water uptake.'
  },
  {
    name: 'Shakthi Coco Power SD',
    alias: ['Shakthi Coco Power SD'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '5 ltr', price: 2999, mrp: 2999 }],
    image: '/assets/products/sb-03.jpg',
    description: 'Soil drenching formulation for mature coconut plantations, maintaining soil biology and crown health.'
  },
  {
    name: 'Shakthi White Gold',
    alias: ['Shakthi White Gold'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '500 ml', price: 699, mrp: 699 }],
    image: '/assets/products/sb-04.jpg',
    description: 'Specialty liquid formulation for enhanced crop flowering, pollination success, and prevention of flower drop.'
  },
  {
    name: 'Boron',
    alias: ['Boron', 'Boron Liquid'],
    form: 'Liquid',
    category: 'Micro-Nutrient',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '500 ml', price: 499, mrp: 499 }],
    image: '/assets/products/sb-26.jpg',
    description: 'Essential micronutrient solution crucial for pollen germination, cell wall development, and sugar translocation.'
  },
  {
    name: 'Zinc',
    alias: ['Zinc', 'Zinc Liquid'],
    form: 'Liquid',
    category: 'Micro-Nutrient',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '250 ml', price: 499, mrp: 499 }],
    image: '/assets/products/sb-27.jpg',
    description: 'Cheated zinc liquid formula to overcome zinc chlorosis, boosting auxin production and enzymatic reactions.'
  },
  {
    name: 'Shakthi Crop Top H3',
    alias: ['SOILLITTO H3', 'Soillitto H3', 'Crop Top H3', 'Shakthi Crop Top H3'],
    form: 'Powder',
    category: 'Soil Conditioner',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '2 KG', price: 1999, mrp: 1999 }],
    image: '/assets/products/soillitto-h3.jpg',
    description: 'High-purity soluble humic complex improving cation exchange capacity (CEC) and soil microbial colonization.'
  },
  {
    name: 'Shakthi Black Carbon',
    alias: ['Black Carbon', 'Shakthi Black Carbon'],
    form: 'Powder',
    category: 'Soil Conditioner',
    hsnCode: '28030090',
    gstRate: 18,
    packs: [{ size: '1 KG', price: 799, mrp: 799 }],
    image: '/assets/products/black-carbon.jpg',
    description: 'Organic activated carbon powder for soil detox, remediation, and sustained nutrient buffering around roots.'
  },
  {
    name: 'Earth Power Pro',
    alias: ['Earth Power Pro'],
    form: 'Powder',
    category: 'Bio-Stimulant',
    hsnCode: '28030090',
    gstRate: 18,
    packs: [{ size: '1 KG', price: 1299, mrp: 1299 }],
    image: '/assets/products/earth-power-pro.jpg',
    description: 'Concentrated natural bio-stimulant powder delivering humic and fulvic acids alongside key microbial metabolites.'
  },
  {
    name: 'Kalium 20',
    alias: ['Kalium 20', 'KALIAM- 20', 'Kaliam 20'],
    form: 'Powder',
    category: 'Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '160 gm', price: 999, mrp: 999 }],
    image: '/uploads/mufteljw964f29cf0cd1.jpg',
    description: 'Concentrated organic potassium nutrition powder aiding in disease tolerance, water regulation, and fruit sizing.'
  },
  {
    name: 'Use It',
    alias: ['Use It', 'USE IT'],
    form: 'Powder',
    category: 'Bio-Stimulant',
    hsnCode: '28030090',
    gstRate: 18,
    packs: [{ size: '1 kg', price: 1600, mrp: 1600 }],
    image: '/assets/products/sb-mtxeelqltsle.jpg',
    description: 'Versatile crop protection and bio-stimulant powder for high-value horticulture and plantation crops.'
  },
  {
    name: 'Nutri Flow',
    alias: ['Nutri Flow'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '5 ltr', price: 2999, mrp: 2999 }],
    image: '/assets/products/nutri-flow.jpg',
    description: 'Liquid fertility catalyst promoting rapid root uptake and continuous sap flow during peak vegetative stages.'
  },
  {
    name: 'Harvest Max',
    alias: ['Harvest Max'],
    form: 'Liquid',
    category: 'Bio-Stimulant',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '5 ltr', price: 2999, mrp: 2999 }],
    image: '/assets/products/harvest-max.jpg',
    description: 'Yield maximizer liquid specially crafted for fruit enlargement, brix enhancement, and uniform ripening.'
  },
  {
    name: 'Carbon Zyme',
    alias: ['Carbon Zyme'],
    form: 'Liquid',
    category: 'Soil Conditioner',
    hsnCode: '28030090',
    gstRate: 18,
    packs: [{ size: '10 Kg', price: 3000, mrp: 3000 }],
    image: '/assets/products/sb-mu5gz97sbx6c.jpg',
    description: 'Liquid carbon enzyme complex revitalizing tired soils and promoting symbiotic mycorrhizal associations.'
  },

  // Page 3
  {
    name: 'Soil Gold',
    alias: ['Soil Gold'],
    form: 'Liquid',
    category: 'Soil Conditioner',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 ltr', price: 2500, mrp: 2500 }],
    image: '/uploads/muften2u62a4229e150f.jpg',
    description: 'Soil health restorer that optimizes pH, unlocks fixed phosphorus, and enriches soil organic matter.'
  },
  {
    name: 'Soil Enricher',
    alias: ['Soil Enrincher', 'Soil Enricher', 'SOIL ENRINCHER'],
    form: 'Liquid',
    category: 'Soil Conditioner',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 ltr', price: 2999, mrp: 2999 }],
    image: '/assets/products/sb-mu89c0tufkk5.jpg',
    description: 'Bio-active liquid amendment specifically developed for degraded soils, restoring microbial diversity.'
  },
  {
    name: 'Red King',
    alias: ['Red King'],
    form: 'Liquid',
    category: 'Soil Conditioner',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '10 ltr', price: 3199, mrp: 3199 }],
    image: '/uploads/muftemkod5a46b820008.jpg',
    description: 'Potent humic-fulvic liquid concentrate providing dark organic matter to accelerate root aeration and drainage.'
  },
  {
    name: 'Shakthi Triple Action Pro',
    alias: ['Shakthi Triple Action Pro'],
    form: 'Liquid',
    category: 'Bio-Pesticide',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '250 ml', price: 999, mrp: 999 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Broad-spectrum organic protection providing triple action against sucking pests, chewing caterpillars, and fungal pathogens.'
  },
  {
    name: 'Target',
    alias: ['Target', 'TARGET'],
    form: 'Powder',
    category: 'Bio-Pesticide',
    hsnCode: '28030090',
    gstRate: 18,
    packs: [{ size: '320 gm', price: 999, mrp: 999 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Fast-acting biological control powder targeting resistant pest larvae and soil grubs naturally.'
  },
  {
    name: 'Rot Killer',
    alias: ['Rot Killer', 'ROT KILLER'],
    form: 'Liquid',
    category: 'Bio-Pesticide',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '250 ml', price: 999, mrp: 999 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Systemic biological fungicide providing targeted protection against root rot, collar rot, and damping off.'
  },
  {
    name: 'Orange',
    alias: ['Orange', 'ORANGE'],
    form: 'Liquid',
    category: 'Bio-Pesticide',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '250 ml', price: 999, mrp: 999 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Botanical citrus-based bio-insecticide effective against whiteflies, aphids, and mites with zero chemical residue.'
  },
  {
    name: 'Jilsil',
    alias: ['Jilsil', 'JILSIL'],
    form: 'Liquid',
    category: 'Wetting Agent',
    hsnCode: '28030090',
    gstRate: 18,
    packs: [
      { size: '50 ml', price: 159, mrp: 159 },
      { size: '250 ml', price: 799, mrp: 799 }
    ],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Super-spreader and silicon-based wetting agent maximizing spray coverage and rain-fastness of foliar applications.'
  },
  {
    name: 'Pseudomonas',
    alias: ['Pseudomonas', 'PSEUDOMONUS', 'Pseudomonus'],
    form: 'Liquid',
    category: 'Bio-Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 599, mrp: 599 }],
    image: '/uploads/muftem2qb95f89acc5dc.jpg',
    description: 'Pseudomonas fluorescens liquid bio-control agent guarding root rhizosphere and controlling bacterial blight.'
  },
  {
    name: 'Trichoderma Viride',
    alias: ['Trichoderma Viride', 'TRICHODERMA VIRITI', 'Trichoderma Viriti'],
    form: 'Liquid',
    category: 'Bio-Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 599, mrp: 599 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Antagonistic fungal bio-control liquid effective against Fusarium, Pythium, and Rhizoctonia soil pathogens.'
  },
  {
    name: 'VAM',
    alias: ['VAM', 'Vesicular Arbuscular Mycorrhiza'],
    form: 'Liquid',
    category: 'Bio-Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 599, mrp: 599 }],
    image: '/uploads/mufteniz2783fb23e878.jpg',
    description: 'Mycorrhizal bio-fertilizer that extends root reach exponentially to harvest phosphorus, zinc, and deep soil moisture.'
  },
  {
    name: 'Bio NPK',
    alias: ['Bio NPK', 'BIO NPK'],
    form: 'Liquid',
    category: 'Bio-Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 599, mrp: 599 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Liquid consortium of Nitrogen fixers, Phosphorus solubilizers, and Potash mobilizers for complete crop nutrition.'
  },
  {
    name: 'B4',
    alias: ['B4', 'B-4'],
    form: 'Liquid',
    category: 'Bio-Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 599, mrp: 599 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Multi-strain microbial inoculation liquid supporting balanced nutrient recycling in organic and natural farming.'
  },

  // Page 4
  {
    name: 'Bio Mask',
    alias: ['Bio Mask', 'BIO MASK'],
    form: 'Liquid',
    category: 'Bio-Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 599, mrp: 599 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Protective liquid microbial formulation helping crops resist abiotic temperature and drought extremes.'
  },
  {
    name: 'Bio Zinc',
    alias: ['Bio Zinc', 'BIO ZINC'],
    form: 'Liquid',
    category: 'Bio-Fertilizer',
    hsnCode: '31010099',
    gstRate: 5,
    packs: [{ size: '1 ltr', price: 599, mrp: 599 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Zinc solubilizing bacterial consortium transforming insoluble zinc in soils into readily bio-available zinc.'
  },
  {
    name: 'Yes Boss Boron',
    alias: ['Yes Boss Boron', 'YES BOSS BORON'],
    form: 'Powder',
    category: 'Fertilizer',
    hsnCode: '31059090',
    gstRate: 5,
    packs: [{ size: '1 Kg', price: 625, mrp: 625 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'High-grade water-soluble Boron (Di-Sodium Octaborate Tetrahydrate) for quick foliar correction of boron deficiency.'
  },
  {
    name: 'Yes Boss All 19:19:19',
    alias: ['YES BOSS ALL -19-19- 19', 'Yes Boss All -19-19- 19', 'Yes Boss All 19-19-19'],
    form: 'Powder',
    category: 'Fertilizer',
    hsnCode: '31026000',
    gstRate: 5,
    packs: [{ size: '25 Kg', price: 5599, mrp: 5599 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: '100% water-soluble 19:19:19 balanced NPK fertilizer with essential trace elements for vigorous crop development.'
  },
  {
    name: 'Yes Boss CN',
    alias: ['YES BOSS CN', 'Yes Boss CN', 'Yes Boss Calcium Nitrate'],
    form: 'Powder',
    category: 'Fertilizer',
    hsnCode: '31026000',
    gstRate: 5,
    packs: [{ size: '25 Kg', price: 3899, mrp: 3899 }],
    image: '/assets/products/photo-coming-soon.svg',
    description: 'Water-soluble Calcium Nitrate fertilizer promoting strong cell walls, superior fruit firmness, and prevention of blossom-end rot.'
  }
];

function normalize(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

console.log(`Processing ${clientData.length} client product specifications...`);

let updatedCount = 0;
let createdCount = 0;

for (const item of clientData) {
  const normNames = [item.name, ...(item.alias || [])].map(normalize);
  
  // Find matching product in existing DB
  const existing = currentProducts.find(p => {
    const pNorm = normalize(p.name);
    return normNames.includes(pNorm);
  });

  const packSizes = item.packs.map(p => p.size);
  const packagePrices = Object.fromEntries(item.packs.map(p => [p.size, p.price]));
  const packageMrps = Object.fromEntries(item.packs.map(p => [p.size, p.mrp]));
  const packDetails = item.packs.map(p => ({ size: p.size, price: String(p.price), mrp: String(p.mrp) }));
  const defaultPack = item.packs[0];

  const payload = {
    name: item.name,
    form: item.form,
    category: item.category,
    hsnCode: item.hsnCode,
    gstRate: item.gstRate,
    cgstRate: +(item.gstRate / 2).toFixed(2),
    sgstRate: +(item.gstRate / 2).toFixed(2),
    igstRate: item.gstRate,
    packSizes,
    selectedPack: defaultPack.size,
    price: defaultPack.price,
    mrp: defaultPack.mrp,
    originalPrice: defaultPack.mrp,
    packagePrices,
    packageMrps,
    packDetails,
    online: true,
    visibility: 'both',
    stock: 100,
    updatedAt: new Date().toISOString()
  };

  if (existing) {
    // Update existing product
    await db.updateProduct(existing.id || existing._id, payload);
    console.log(`✏️ Updated: ${existing.name} -> ${item.name} (${defaultPack.size} @ ₹${defaultPack.price})`);
    updatedCount++;
  } else {
    // Create new product
    const newId = `sb-cli-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const fullDoc = {
      _id: newId,
      id: newId,
      ...payload,
      description: item.description,
      detailedDescription: item.description,
      howToUse: 'Refer to product packaging for specific crop dosages.',
      whenToUse: 'Apply during key vegetative and crop development stages.',
      crops: ['All Crops'],
      diseases: [],
      targetUserId: 'all',
      targetUserName: 'All Users (General Catalog)',
      image: item.image,
      images: [item.image],
      reviewsEnabled: false,
      reviews: [],
      rating: null,
      reviewsCount: 0,
      createdAt: new Date().toISOString()
    };
    await db.createProduct(fullDoc);
    console.log(`✨ Created: ${item.name} (${defaultPack.size} @ ₹${defaultPack.price})`);
    createdCount++;
  }
}

console.log(`\n🎉 Completed! Updated: ${updatedCount}, Created: ${createdCount}`);
process.exit(0);
