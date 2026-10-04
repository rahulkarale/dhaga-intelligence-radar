/**
 * Dhaga & Co. Realistic Datasets & Benchmarks
 * Modeled on the client brief:
 * - 48k orders/week, ₹840 AOV, 31% return rate, 44% in 'Other'
 * - Vendors in Tiruppur (knits/basics) and Jaipur (ethnic wear/kurtis)
 * - Hinglish vernacular expressions, occasion-based searches, messy color spellings
 * - Bad input test cases for defensive pipeline validation
 */

export interface Vendor {
  id: string;
  name: string;
  hub: 'Jaipur' | 'Tiruppur' | 'Surat' | 'Delhi';
  category: 'Womenswear' | 'Kidswear' | 'Mens Basics';
  leadTimeDays: number;
  activeSkus: number;
  returnRate: number; // percentage
  topDefect: string;
  rating: number;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  orderDate: string;
  deliveredDate: string;
  returnDate: string;
  sku: string;
  productName: string;
  vendorId: string;
  vendorName: string;
  category: 'Womenswear' | 'Kidswear' | 'Mens Basics';
  price: number;
  sizeOrdered: string;
  colorRaw: string;
  officialReturnReason: string;
  freeTextOtherReason: string;
  customerLanguage: 'Hinglish' | 'English' | 'Hindi';
  cod: boolean;
  status: 'Initiated' | 'In-Transit' | 'Inspected-Restocked' | 'Inspected-Rejected';
}

export interface ValidationCase {
  id: string;
  name: string;
  description: string;
  ruleCategory: 'Integrity' | 'Temporal' | 'Schema' | 'Business Logic';
  samplePayload: Record<string, unknown>;
  expectedValid: boolean;
  expectedError: string;
}

export const DHAGA_VENDORS: Vendor[] = [
  {
    id: 'VEND-JPR-01',
    name: 'Anokhi Weaves & Prints',
    hub: 'Jaipur',
    category: 'Womenswear',
    leadTimeDays: 14,
    activeSkus: 480,
    returnRate: 38.4,
    topDefect: 'Bust allowance tighter by 1.8" than size chart; color bleed in first wash',
    rating: 3.4,
  },
  {
    id: 'VEND-JPR-02',
    name: 'Pink City Handlooms',
    hub: 'Jaipur',
    category: 'Womenswear',
    leadTimeDays: 11,
    activeSkus: 320,
    returnRate: 34.2,
    topDefect: 'Armhole circumference constriction in XL and XXL kurtas',
    rating: 3.7,
  },
  {
    id: 'VEND-TPR-01',
    name: 'Kongu Knits Mills',
    hub: 'Tiruppur',
    category: 'Mens Basics',
    leadTimeDays: 7,
    activeSkus: 210,
    returnRate: 19.8,
    topDefect: 'Neckline ribbing stretched after single wear',
    rating: 4.2,
  },
  {
    id: 'VEND-TPR-02',
    name: 'Evergreen Cotton Tex',
    hub: 'Tiruppur',
    category: 'Kidswear',
    leadTimeDays: 9,
    activeSkus: 390,
    returnRate: 28.5,
    topDefect: 'Length shrunk 2.5 inches post steam press',
    rating: 3.8,
  },
  {
    id: 'VEND-SUR-01',
    name: 'Radhe Synthetics & Georgette',
    hub: 'Surat',
    category: 'Womenswear',
    leadTimeDays: 12,
    activeSkus: 410,
    returnRate: 36.1,
    topDefect: 'Fabric transparent / lining missing in Anarkali flare',
    rating: 3.5,
  },
  {
    id: 'VEND-DLH-01',
    name: 'Capital Stitchworks',
    hub: 'Delhi',
    category: 'Womenswear',
    leadTimeDays: 8,
    activeSkus: 190,
    returnRate: 25.3,
    topDefect: 'Zippers jamming on side seam dresses',
    rating: 4.0,
  },
];

export const DHAGA_SAMPLE_RETURNS: ReturnRecord[] = [
  {
    id: 'RET-88201',
    orderId: 'ORD-991204',
    orderDate: '2026-09-20',
    deliveredDate: '2026-09-24',
    returnDate: '2026-09-25',
    sku: 'KUR-JPR-402',
    productName: 'Gulabi Hand-block Printed Chanderi Kurti',
    vendorId: 'VEND-JPR-01',
    vendorName: 'Anokhi Weaves & Prints',
    category: 'Womenswear',
    price: 899,
    sizeOrdered: 'M',
    colorRaw: 'rani gulabi',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'Size M mangwaya tha par bust area bohot tight hai, bilkul fit nahi baith raha. Aur kapda ek baar paani lagne pe pink color nikal raha hai.',
    customerLanguage: 'Hinglish',
    cod: true,
    status: 'Initiated',
  },
  {
    id: 'RET-88202',
    orderId: 'ORD-991238',
    orderDate: '2026-09-18',
    deliveredDate: '2026-09-22',
    returnDate: '2026-09-23',
    sku: 'TSH-TPR-108',
    productName: 'Everyday Combed Cotton Crewneck (Pack of 2)',
    vendorId: 'VEND-TPR-01',
    vendorName: 'Kongu Knits Mills',
    category: 'Mens Basics',
    price: 599,
    sizeOrdered: 'L',
    colorRaw: 'navy neela',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'Neckline loose ho gaya 1 din pehanne ke baad hi, collar loose hai aur shoulders drop ho rahe hain.',
    customerLanguage: 'Hinglish',
    cod: true,
    status: 'In-Transit',
  },
  {
    id: 'RET-88203',
    orderId: 'ORD-991310',
    orderDate: '2026-09-19',
    deliveredDate: '2026-09-23',
    returnDate: '2026-09-24',
    sku: 'KID-ANK-205',
    productName: 'Festive Tiered Floral Anarkali Set for Girls',
    vendorId: 'VEND-TPR-02',
    vendorName: 'Evergreen Cotton Tex',
    category: 'Kidswear',
    price: 949,
    sizeOrdered: '6-7Y',
    colorRaw: 'haldi yellow',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'My daughter is 6 years old, the waist elastic is pinching very hard and marks pad rahe hain. Size is smaller than standard 6Y.',
    customerLanguage: 'Hinglish',
    cod: false,
    status: 'Inspected-Restocked',
  },
  {
    id: 'RET-88204',
    orderId: 'ORD-991402',
    orderDate: '2026-09-21',
    deliveredDate: '2026-09-25',
    returnDate: '2026-09-26',
    sku: 'DRS-SUR-601',
    productName: 'Mehndi Occasion Flared Georgette Maxi',
    vendorId: 'VEND-SUR-01',
    vendorName: 'Radhe Synthetics & Georgette',
    category: 'Womenswear',
    price: 1299,
    sizeOrdered: 'XL',
    colorRaw: 'bottle hara',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'Material pura transparent hai bina inner slip ke pehan nahi sakte. Listing me lining likha tha par lining sirf torso me hai, bottom see-through hai.',
    customerLanguage: 'Hinglish',
    cod: true,
    status: 'Initiated',
  },
  {
    id: 'RET-88205',
    orderId: 'ORD-991455',
    orderDate: '2026-09-22',
    deliveredDate: '2026-09-26',
    returnDate: '2026-09-27',
    sku: 'KUR-JPR-512',
    productName: 'Straight Fit Office Wear Cotton Kurta with Pockets',
    vendorId: 'VEND-JPR-02',
    vendorName: 'Pink City Handlooms',
    category: 'Womenswear',
    price: 699,
    sizeOrdered: 'S',
    colorRaw: 'pastel pista',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'Sleeves are too short for office wear, folds tight when raising hands. Pocket stitch khul gaya pehle din hi.',
    customerLanguage: 'Hinglish',
    cod: false,
    status: 'In-Transit',
  },
  {
    id: 'RET-88206',
    orderId: 'ORD-991512',
    orderDate: '2026-09-23',
    deliveredDate: '2026-09-27',
    returnDate: '2026-09-28',
    sku: 'JOG-TPR-304',
    productName: 'Boys French Terry Active Jogger',
    vendorId: 'VEND-TPR-02',
    vendorName: 'Evergreen Cotton Tex',
    category: 'Kidswear',
    price: 499,
    sizeOrdered: '9-10Y',
    colorRaw: 'charcoal grey',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'Drawstring dummy nikla, waist tight karne ka option nahi hai. Bacche ko loose ho raha hai waist se.',
    customerLanguage: 'Hinglish',
    cod: true,
    status: 'Initiated',
  },
  {
    id: 'RET-88207',
    orderId: 'ORD-991580',
    orderDate: '2026-09-24',
    deliveredDate: '2026-09-28',
    returnDate: '2026-09-29',
    sku: 'POL-TPR-202',
    productName: 'Classic Honeycomb Pique Polo T-Shirt',
    vendorId: 'VEND-TPR-01',
    vendorName: 'Kongu Knits Mills',
    category: 'Mens Basics',
    price: 649,
    sizeOrdered: 'XXL',
    colorRaw: 'maroon lal',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'Ordered XXL according to chart, but fitting is slim-fit chest feels like L. Belly area pe buttons stretch ho rahe hain.',
    customerLanguage: 'Hinglish',
    cod: true,
    status: 'Initiated',
  },
  {
    id: 'RET-88208',
    orderId: 'ORD-991620',
    orderDate: '2026-09-25',
    deliveredDate: '2026-09-29',
    returnDate: '2026-09-30',
    sku: 'KUR-JPR-402',
    productName: 'Gulabi Hand-block Printed Chanderi Kurti',
    vendorId: 'VEND-JPR-01',
    vendorName: 'Anokhi Weaves & Prints',
    category: 'Womenswear',
    price: 899,
    sizeOrdered: 'L',
    colorRaw: 'rani pink',
    officialReturnReason: 'Other',
    freeTextOtherReason: 'Repeated complaint! Jaipur vendor ka M bhi tight tha ab L mangwaya to shoulder theek hai par chest me abhi bhi tight hai. Sizing chart galat hai.',
    customerLanguage: 'Hinglish',
    cod: false,
    status: 'Initiated',
  },
];

export const VALIDATION_BENCHMARK_CASES: ValidationCase[] = [
  {
    id: 'VAL-01',
    name: 'Return Before Delivery (Temporal Inversion)',
    description: 'A return record created with return_date prior to delivered_date.',
    ruleCategory: 'Temporal',
    samplePayload: {
      return_id: 'RET-ERR-01',
      order_id: 'ORD-77102',
      order_date: '2026-09-10',
      delivered_date: '2026-09-15',
      return_date: '2026-09-12', // 3 days before delivered!
      sku: 'KUR-JPR-402',
      reason: 'Other',
    },
    expectedValid: false,
    expectedError: 'Invalid Temporal Sequence: return_date (2026-09-12) precedes delivered_date (2026-09-15).',
  },
  {
    id: 'VAL-02',
    name: 'Broken Foreign Key (Orphan SKU)',
    description: 'Return references a SKU not present in the master catalogue.',
    ruleCategory: 'Integrity',
    samplePayload: {
      return_id: 'RET-ERR-02',
      order_id: 'ORD-77105',
      sku: 'GHOST-SKU-99999',
      vendor_id: 'VEND-JPR-01',
      reason: 'Defective',
    },
    expectedValid: false,
    expectedError: 'Broken Foreign Key: SKU GHOST-SKU-99999 does not exist in Dhaga & Co. active catalogue of 14,000 SKUs.',
  },
  {
    id: 'VAL-03',
    name: 'Duplicate Physical Return (Double Return Claim)',
    description: 'Customer initiates two return records for the exact same order line item.',
    ruleCategory: 'Business Logic',
    samplePayload: {
      return_id: 'RET-88201-DUP',
      order_id: 'ORD-991204',
      item_id: 'ITEM-402-A',
      existing_return_id: 'RET-88201',
    },
    expectedValid: false,
    expectedError: 'Duplicate Return Detected: Item ITEM-402-A already has an active return ticket RET-88201.',
  },
  {
    id: 'VAL-04',
    name: 'Invalid Rating (Fractional / Out-of-bounds)',
    description: 'Star rating submitted as 4.75 or 7.0 instead of integer 1 to 5.',
    ruleCategory: 'Schema',
    samplePayload: {
      review_id: 'REV-991',
      rating: 4.75, // Fractional
      review_text: 'Good dress but sleeves loose',
    },
    expectedValid: false,
    expectedError: 'Invalid Schema: Rating must be an integer between 1 and 5 (got 4.75).',
  },
  {
    id: 'VAL-05',
    name: 'Review Before Delivery',
    description: 'Review timestamp predates order delivery confirmation.',
    ruleCategory: 'Temporal',
    samplePayload: {
      order_id: 'ORD-881',
      delivered_date: '2026-09-20',
      review_date: '2026-09-17',
    },
    expectedValid: false,
    expectedError: 'Invalid Review Timing: Review submitted before order delivery was confirmed.',
  },
  {
    id: 'VAL-06',
    name: 'Empty Review / Missing Free Text Reason',
    description: 'Return marked as "Other" but free-text box left blank.',
    ruleCategory: 'Schema',
    samplePayload: {
      return_id: 'RET-ERR-06',
      official_reason: 'Other',
      free_text: '   ',
    },
    expectedValid: false,
    expectedError: 'Empty Explanation: When official return reason is "Other", free_text explanation is mandatory.',
  },
  {
    id: 'VAL-07',
    name: 'Missing Mandatory Column',
    description: 'Batch upload CSV payload missing vendor_id column.',
    ruleCategory: 'Schema',
    samplePayload: {
      sku: 'TSH-TPR-108',
      price: 599,
      // vendor_id is omitted
    },
    expectedValid: false,
    expectedError: 'Schema Violation: Missing required column "vendor_id".',
  },
];

export const DHAGA_BUSINESS_CONSTANTS = {
  weeklyOrders: 48000,
  averageOrderValueInr: 840,
  weeklyGmvInr: 48000 * 840, // ₹40,320,000 (~₹4.03 Cr/week)
  overallReturnRate: 0.31, // 31%
  otherReasonShare: 0.44, // 44% of returns land in "Other"
  weeklyReturns: 48000 * 0.31, // 14,880 returns/week
  weeklyOtherReturns: 48000 * 0.31 * 0.44, // ~6,547 unclassified returns/week
  manualReadCapacityPerWeek: 300, // Neha's capacity by hand (~4.5%)
  rtoCostPerOrderInr: 120, // Faizan: ₹120 logistics cost per RTO
  codShare: 0.61, // 61% COD
  codRtoRate: 0.26, // 26% RTO on COD
};
