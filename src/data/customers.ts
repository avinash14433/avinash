import { products } from './products';

export type Customer = { firstName: string; lastName: string; postalCode: string };

export const validCustomer: Customer = { firstName: 'Avinash', lastName: 'Reddy', postalCode: '500034' };

/** Expected order for TC18–TC21: Onesie + Bike Light, tax at the assumed 8% (A2). */
export const expectedOrder = {
  items: [products.onesie, products.bikeLight],
  subtotal: 17.98,
  tax: 1.44,
  total: 19.42,
};

// Drives the parameterized test TC13–TC15.
export const missingFieldCases: { id: string; field: string; customer: Customer; error: string }[] = [
  { id: 'TC13', field: 'first name', customer: { ...validCustomer, firstName: '' }, error: 'Error: First Name is required' },
  { id: 'TC14', field: 'last name', customer: { ...validCustomer, lastName: '' }, error: 'Error: Last Name is required' },
  { id: 'TC15', field: 'postal code', customer: { ...validCustomer, postalCode: '' }, error: 'Error: Postal Code is required' },
];
