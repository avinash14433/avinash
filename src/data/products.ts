export type Product = { slug: string; name: string; price: number };

export const products = {
  onesie: { slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: 7.99 },
  bikeLight: { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
} satisfies Record<string, Product>;

export const PRODUCT_COUNT = 6;

/** Onesie, Bike Light, Bolt T-Shirt – used by the multi-item cart cases. */
export const threeItems: Product[] = [products.onesie, products.bikeLight, products.boltTShirt];

export const formatPrice = (p: Product): string => `$${p.price.toFixed(2)}`;
