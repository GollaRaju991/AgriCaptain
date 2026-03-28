import { products } from './products';

export const seedsProducts = products.filter(p => p.category === 'seeds');
