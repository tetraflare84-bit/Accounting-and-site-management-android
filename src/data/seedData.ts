import { CompanyProfile, ClientSite, Expense, Invoice, Estimate, SitePhoto, TimeLog } from '../types';

export const initialCompanyProfile: CompanyProfile = {
  name: 'Your Neighbourhood Plant Guy',
  ownerName: 'Trevor Auton',
  tagline: 'Eco Friendly Yard Care for all your needs',
  experienceYears: 25,
  officePhone: '905-252-7619',
  cellPhone: '905-252-3569',
  email: 'YourNeighbourhoodPlantGuy@gmail.com',
  website: 'YourNeighbourhoodPlantGuy.com',
  address: 'Maplewood, ON',
  taxNumber: 'HST-849204918RT0001',
  taxRate: 0.13, // 13% Ontario HST
  currency: '$',
  logoUri: '/src/assets/images/brand_plant_guy_1791836662783.jpg',
  services: [
    'Pest & Disease Control',
    'Mosquito & Ticks Prevention',
    'Property Management',
    'Pruning & Shaping',
    'Garden Maintenance',
    'Fruit Tree Care',
    'Fertilizing & Spraying',
    'Houseplants Consultation',
    'Hedges & Tree Trimming',
    'Design & Planting',
    'Removals & Cleanups',
    'Troubled Boxwoods Recovery',
    'Lawn Care & More'
  ],
  termsAndConditions: [
    'Customer to provide all materials in advance prior to project completion',
    'All disposal handled through yard waste or additional charges apply',
    'Spring openings and Fall cleanups not part of scheduled lawn maintenance regimes',
    'Payment due upon receipt of invoice unless otherwise negotiated in writing'
  ],
  categories: [
    {
      id: 'cat_plants',
      name: 'Plants & Nursery',
      icon: 'Sprout',
      description: 'Perennials, shrubs, nursery trees, annual flowers, bulbs',
      color: '#16a34a',
      monthlyBudget: 2500,
    },
    {
      id: 'cat_soil',
      name: 'Bulk Soil & Mulch',
      icon: 'Layers',
      description: 'Triple mix, organic compost, black/cedar mulch, river rock',
      color: '#b45309',
      monthlyBudget: 1800,
    },
    {
      id: 'cat_tools',
      name: 'Tools & Equipment',
      icon: 'Wrench',
      description: 'Trimmers, hedge shears, lawnmowers, blade sharpening, safety gear',
      color: '#0284c7',
      monthlyBudget: 600,
    },
    {
      id: 'cat_fuel',
      name: 'Fuel & Vehicle',
      icon: 'Fuel',
      description: 'Truck gas, mixed 2-stroke fuel, trailer maintenance & tire repairs',
      color: '#ea580c',
      monthlyBudget: 950,
    },
    {
      id: 'cat_disposal',
      name: 'Disposal & Yard Waste',
      icon: 'Trash2',
      description: 'Transfer station tipping fees, yard waste bin rentals, branch chipping',
      color: '#78716c',
      monthlyBudget: 500,
    },
    {
      id: 'cat_labor',
      name: 'Subcontractor & Crew',
      icon: 'Users',
      description: 'Assistant gardener day wages, specialist arborists, seasonal helpers',
      color: '#9333ea',
      monthlyBudget: 3200,
    },
    {
      id: 'cat_materials',
      name: 'Materials & Supplies',
      icon: 'Package',
      description: 'Landscape fabric, edging, organic fertilizers, tree stakes, twine',
      color: '#059669',
      monthlyBudget: 750,
    },
    {
      id: 'cat_office',
      name: 'Office & Software',
      icon: 'Briefcase',
      description: 'Mobile phone plans, bookkeeping subscriptions, flyers & printing',
      color: '#475569',
      monthlyBudget: 350,
    },
    {
      id: 'cat_other',
      name: 'General & Miscellaneous',
      icon: 'MoreHorizontal',
      description: 'Crew hydration, parking, unexpected job expenses',
      color: '#64748b',
      monthlyBudget: 250,
    }
  ],
  backupSettings: {
    provider: 'google_drive',
    autoSyncInterval: 'daily',
    targetFolder: 'PlantGuy_Drive_Backup/Bookkeeping',
    lastBackupTime: '2026-10-12 11:45 AM',
    lastChecksum: '7a9f82d1'
  }
};

export const initialClients: ClientSite[] = [
  {
    id: 'client_57_magani',
    name: '57 Magani',
    phone: '905-555-0192',
    email: 'client57magani@gmail.com',
    address: '57 Magani Ave, Richmond Hill, ON L4E 3M4',
    gpsCoordinates: {
      lat: 43.8962,
      lng: -79.4385,
      accuracy: 6.2
    },
    folders: ['Plants', 'Designs', 'Photos', 'Invoices', 'Shopping Lists'],
    notes: 'Full backyard garden renovation. Customer requested cedar mulch, boxwoods hedge along patio, and perennial flower border.',
    shoppingListText: `57 MAGANI BACKYARD SHOPPING LIST:
1. Boxwood Shrubs (2 Gal) - 6 units
2. Triple Mix Premium Soil (30L) - 8 bags
3. Dark Cedar Mulch (50L) - 12 bags
4. Hydrangea Macrophylla (3 Gal) - 4 units
5. Black Aluminum Garden Edging - 30 ft
6. Organic Bone Meal & Fertilizer - 1 tub
Notes: Customer will supply paving stones for walkway prior to Thursday installation.`,
    createdAt: '2026-05-18'
  },
  {
    id: 'client_14_oakview',
    name: '14 Oakview Terrace',
    phone: '905-555-8831',
    email: 'sarah.miller@oakview.ca',
    address: '14 Oakview Terrace, Aurora, ON L4G 2J1',
    gpsCoordinates: {
      lat: 44.0012,
      lng: -79.4673,
      accuracy: 8.5
    },
    folders: ['Photos', 'Designs', 'Invoices'],
    notes: 'Seasonal hedge trimming and boxwood fungal treatment. Scheduled bi-weekly maintenance.',
    shoppingListText: 'Organic copper fungicide spray (2 bottles), tree pruning shears, 4 lawn bags.',
    createdAt: '2026-06-01'
  },
  {
    id: 'client_82_pine_valley',
    name: '82 Pine Valley Crescent',
    phone: '905-555-3419',
    email: 'robert.chen@gmail.com',
    address: '82 Pine Valley Cres, Vaughan, ON L4L 2B5',
    gpsCoordinates: {
      lat: 43.8341,
      lng: -79.5829,
      accuracy: 5.1
    },
    folders: ['Plants', 'Photos', 'Invoices'],
    notes: 'Front yard curb appeal makeover. Hostas, Japanese Maple, and river rock accent border.',
    shoppingListText: '1x Bloodgood Japanese Maple (7 Gal), 6x Patriot Hostas, 8 bags Black Mulch.',
    createdAt: '2026-06-15'
  }
];

export const initialSitePhotos: SitePhoto[] = [
  {
    id: 'photo_57_magani_1',
    clientId: 'client_57_magani',
    folder: 'Photos',
    filename: '5b633837-f5bb-46ce-96e7-48a61c3d081a.jpg',
    caption: 'Backyard site overview before mulch bed extension',
    timestamp: '2026-06-02 11:20 AM',
    imageUri: '/src/assets/images/garden_site_sample_1791836672822.jpg',
    annotations: [
      {
        id: 'ann_1',
        type: 'rect',
        color: '#22c55e',
        strokeWidth: 3,
        points: [{ x: 120, y: 220 }, { x: 380, y: 390 }],
        text: 'Plant Bed 1 (Cedar Mulch + Boxwoods)'
      },
      {
        id: 'ann_2',
        type: 'arrow',
        color: '#eab308',
        strokeWidth: 4,
        points: [{ x: 420, y: 150 }, { x: 320, y: 240 }],
        text: 'Walkway curve to patio'
      }
    ],
    notes: 'Soil graded towards center drain. Lawn edging installed along curved bed.',
    fileType: 'photo'
  },
  {
    id: 'photo_57_magani_2',
    clientId: 'client_57_magani',
    folder: 'Plants',
    filename: '9f3aa860-b8e4-41cd-9e43-759c4cfbbd0c.jpg',
    caption: 'Perennial flower borders and hydrangeas in bloom',
    timestamp: '2026-06-08 01:32 PM',
    imageUri: '/src/assets/images/garden_site_sample_1791836672822.jpg',
    annotations: [],
    notes: 'Hydrangeas positioned under dappled shade for optimal summer vigor.',
    fileType: 'photo'
  },
  {
    id: 'photo_57_magani_design',
    clientId: 'client_57_magani',
    folder: 'Designs',
    filename: 'final design1.png',
    caption: 'Approved landscape layout & planting scheme',
    timestamp: '2026-06-01 09:15 AM',
    imageUri: '/src/assets/images/garden_site_sample_1791836672822.jpg',
    annotations: [],
    notes: 'Garden design layout approved by homeowner on June 1st.',
    fileType: 'design'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    date: '2026-06-02',
    merchant: 'Green Thumb Nursery & Landscaping Supply',
    category: 'Plants & Nursery',
    subCategory: 'Nursery Stock & Soil',
    amount: 365.28,
    tax: 42.02,
    currency: '$',
    paymentMethod: 'Visa',
    receiptNumber: '214578-01',
    receiptImageUri: '/src/assets/images/receipt_nursery_sample_1791836681709.jpg',
    notes: 'Boxwoods, triple mix soil, and cedar mulch for 57 Magani installation.',
    clientId: 'client_57_magani',
    clientName: '57 Magani',
    lineItems: [
      { description: 'Boxwood Shrubs (2 Gal)', quantity: 6, price: 29.99, extPrice: 179.94 },
      { description: 'Triple Mix Soil (30L)', quantity: 8, price: 7.49, extPrice: 59.92 },
      { description: 'Cedar Mulch (50L)', quantity: 12, price: 6.95, extPrice: 83.40 }
    ],
    synced: true,
    createdAt: '2026-06-02T11:45:00Z'
  },
  {
    id: 'exp_2',
    date: '2026-06-03',
    merchant: 'Petro-Canada Richmond Hill',
    category: 'Fuel & Vehicle',
    subCategory: 'Truck Fuel',
    amount: 114.50,
    tax: 13.17,
    currency: '$',
    paymentMethod: 'Debit',
    receiptNumber: 'PC-88129',
    notes: 'Diesel for work truck and 2-stroke mixed fuel container.',
    clientId: 'client_57_magani',
    clientName: '57 Magani',
    synced: true,
    createdAt: '2026-06-03T08:15:00Z'
  },
  {
    id: 'exp_3',
    date: '2026-06-05',
    merchant: 'York Region Waste Transfer Station',
    category: 'Disposal & Yard Waste',
    subCategory: 'Green Waste Tipping',
    amount: 68.00,
    tax: 7.82,
    currency: '$',
    paymentMethod: 'Mastercard',
    receiptNumber: 'YR-49102',
    notes: 'Branches, old root balls, and sod clippings disposal from 57 Magani garden bed excavation.',
    clientId: 'client_57_magani',
    clientName: '57 Magani',
    synced: true,
    createdAt: '2026-06-05T16:30:00Z'
  },
  {
    id: 'exp_4',
    date: '2026-06-10',
    merchant: 'Home Hardware & Garden Center',
    category: 'Materials & Supplies',
    subCategory: 'Edging & Stakes',
    amount: 89.45,
    tax: 10.29,
    currency: '$',
    paymentMethod: 'Visa',
    receiptNumber: 'HH-33910',
    notes: 'Heavy duty poly garden edging and metal anchor pins.',
    clientId: 'client_14_oakview',
    clientName: '14 Oakview Terrace',
    synced: true,
    createdAt: '2026-06-10T10:00:00Z'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv_57_magani_01',
    invoiceNumber: 'INV-2026-042',
    date: '2026-06-12',
    dueDate: '2026-06-26',
    clientId: 'client_57_magani',
    clientName: '57 Magani',
    clientPhone: '905-555-0192',
    clientAddress: '57 Magani Ave, Richmond Hill, ON',
    templateType: 'landscaping_standard',
    items: [
      {
        id: 'item_1',
        task: 'Eco-Friendly Backyard Garden Bed Excavation & Soil Prep',
        quantity: 1,
        price: 450.00,
        extPrice: 450.00
      },
      {
        id: 'item_2',
        task: 'Installation of 6 Boxwood Shrubs & 4 Hydrangea Perennials',
        quantity: 1,
        price: 380.00,
        extPrice: 380.00
      },
      {
        id: 'item_3',
        task: 'Spreading 12 Bags Dark Cedar Mulch & Edge Trenching',
        quantity: 1,
        price: 240.00,
        extPrice: 240.00
      },
      {
        id: 'item_4',
        task: 'Organic Fertilizer & Deep Root Feeding Regime',
        quantity: 1,
        price: 110.00,
        extPrice: 110.00
      }
    ],
    subtotal: 1180.00,
    taxRate: 0.13,
    taxAmount: 153.40,
    total: 1333.40,
    status: 'paid',
    paidDate: '2026-06-15',
    terms: [
      'Customer to provide all materials in advance prior to project completion',
      'All disposal handled through yard waste or additional charges apply',
      'Spring openings and Fall cleanups not part of scheduled lawn maintenance regimes'
    ],
    notes: 'Thank you for supporting your local neighbourhood plant specialist!',
    createdAt: '2026-06-12T09:00:00Z'
  },
  {
    id: 'inv_14_oakview_01',
    invoiceNumber: 'INV-2026-043',
    date: '2026-06-20',
    dueDate: '2026-07-04',
    clientId: 'client_14_oakview',
    clientName: '14 Oakview Terrace',
    clientPhone: '905-555-8831',
    clientAddress: '14 Oakview Terrace, Aurora, ON',
    templateType: 'landscaping_standard',
    items: [
      {
        id: 'item_o1',
        task: 'Cedar Hedge Precision Trimming & Shaping (approx 65 linear ft)',
        quantity: 1,
        price: 360.00,
        extPrice: 360.00
      },
      {
        id: 'item_o2',
        task: 'Troubled Boxwoods Fungal Treatment & Deep Mulch Renewal',
        quantity: 1,
        price: 220.00,
        extPrice: 220.00
      }
    ],
    subtotal: 580.00,
    taxRate: 0.13,
    taxAmount: 75.40,
    total: 655.40,
    status: 'sent',
    terms: [
      'Customer to provide all materials in advance prior to project completion',
      'All disposal handled through yard waste or additional charges apply',
      'Spring openings and Fall cleanups not part of scheduled lawn maintenance regimes'
    ],
    createdAt: '2026-06-20T14:00:00Z'
  }
];

export const initialTimeLogs: TimeLog[] = [
  {
    id: 'time_1',
    clientId: 'client_57_magani',
    clientName: '57 Magani',
    employeeName: 'Trevor Auton',
    date: '2026-06-02',
    startTime: '08:30 AM',
    endTime: '01:00 PM',
    durationMinutes: 270,
    hourlyRate: 65.00,
    taskDescription: 'Site measurement, bed edging, and soil enrichment',
    billed: true,
    invoiceId: 'inv_57_magani_01'
  },
  {
    id: 'time_2',
    clientId: 'client_57_magani',
    clientName: '57 Magani',
    employeeName: 'Trevor Auton',
    date: '2026-06-03',
    startTime: '09:00 AM',
    endTime: '02:30 PM',
    durationMinutes: 330,
    hourlyRate: 65.00,
    taskDescription: 'Planting 6 boxwoods, spreading cedar mulch, cleanup',
    billed: true,
    invoiceId: 'inv_57_magani_01'
  },
  {
    id: 'time_3',
    clientId: 'client_14_oakview',
    clientName: '14 Oakview Terrace',
    employeeName: 'Trevor Auton',
    date: '2026-06-20',
    startTime: '09:00 AM',
    endTime: '12:30 PM',
    durationMinutes: 210,
    hourlyRate: 65.00,
    taskDescription: 'Cedar hedge shaping and boxwood therapeutic spraying',
    billed: false
  }
];

export const initialEstimates: Estimate[] = [
  {
    id: 'est_57_magani_phase2',
    estimateNumber: 'EST-2026-018',
    date: '2026-06-25',
    validUntil: '2026-07-25',
    clientId: 'client_57_magani',
    clientName: '57 Magani',
    clientPhone: '905-555-0192',
    clientAddress: '57 Magani Ave, Richmond Hill, ON',
    templateType: 'proposal',
    items: [
      {
        id: 'est_item_1',
        task: 'Phase 2: Front Yard Interlock Walkway & Natural Armour Stone Border',
        quantity: 1,
        price: 1650.00,
        extPrice: 1650.00
      },
      {
        id: 'est_item_2',
        task: 'Supply & Plant 8x Korean Boxwoods along Porch Foundation',
        quantity: 1,
        price: 480.00,
        extPrice: 480.00
      },
      {
        id: 'est_item_3',
        task: 'River Rock Mulch Bed Dressing & Commercial Landscape Fabric',
        quantity: 1,
        price: 320.00,
        extPrice: 320.00
      }
    ],
    subtotal: 2450.00,
    taxRate: 0.13,
    taxAmount: 318.50,
    total: 2768.50,
    status: 'pending',
    terms: [
      'Quote valid for 30 days from date of issue',
      '50% deposit required upon project scheduling and material booking',
      'Customer to provide all materials in advance prior to project completion if self-sourced',
      'All disposal handled through yard waste or additional charges apply',
      'Spring openings and Fall cleanups not part of scheduled lawn maintenance regimes'
    ],
    notes: 'Phase 2 estimate for homeowner review before project commencement.',
    createdAt: '2026-06-25T10:00:00Z'
  },
  {
    id: 'est_82_pine_valley_01',
    estimateNumber: 'EST-2026-019',
    date: '2026-06-28',
    validUntil: '2026-07-28',
    clientId: 'client_82_pine_valley',
    clientName: '82 Pine Valley Crescent',
    clientPhone: '905-555-3419',
    clientAddress: '82 Pine Valley Cres, Vaughan, ON',
    templateType: 'proposal',
    items: [
      {
        id: 'est_item_pv1',
        task: 'Curb Appeal Package: Japanese Maple (7 Gal) & 6 Patriot Hostas',
        quantity: 1,
        price: 680.00,
        extPrice: 680.00
      },
      {
        id: 'est_item_pv2',
        task: 'Black Cedar Mulch Bed Trenching (8 bags) & Organic Bone Meal',
        quantity: 1,
        price: 240.00,
        extPrice: 240.00
      }
    ],
    subtotal: 920.00,
    taxRate: 0.13,
    taxAmount: 119.60,
    total: 1039.60,
    status: 'accepted',
    terms: [
      'Quote valid for 30 days from date of issue',
      '50% deposit required upon project scheduling',
      'All disposal handled through yard waste or additional charges apply'
    ],
    notes: 'Homeowner approved proposal! Ready to convert into project invoice upon work completion.',
    createdAt: '2026-06-28T14:30:00Z'
  }
];

