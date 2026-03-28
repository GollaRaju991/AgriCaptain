import { products } from './products';

export const farmToolsProducts = products.filter(p => {
  const cat = (p.category || '').toLowerCase();
  return cat.includes('tool') || cat.includes('equipment') || cat.includes('farm tools');
});
