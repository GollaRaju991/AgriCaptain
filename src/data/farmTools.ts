import { products } from './products';

export const farmToolsProducts = products.filter(p =>
  p.category === 'tools' || p.category === 'equipment'
);
