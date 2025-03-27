export const SHIPPING_RATE = 0.01; // per kg per km
export const SHIPPING_THRESHOLD = 0.15; // can't exceed 15% of order amount
export const DISCOUNT_TIERS = [
    { minQuantity: 250, discountRate: 0.2 },  // 20% discount for 250+
    { minQuantity: 100, discountRate: 0.15 }, // 15% for 100+
    { minQuantity: 50, discountRate: 0.1 },  // 10% for 50+
    { minQuantity: 25, discountRate: 0.05 }, // 5% for 25+
];

