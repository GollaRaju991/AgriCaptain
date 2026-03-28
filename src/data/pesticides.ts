import { products } from './products';

export const pesticideProducts = products.filter(p =>
  p.category === 'agriculture' || p.category === 'plant-growth'
);
