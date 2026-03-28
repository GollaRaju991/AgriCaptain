import { products } from './products';

export const pesticideProducts = products.filter(p => {
  const cat = (p.category || '').toLowerCase();
  return cat.includes('pesticid') || cat.includes('insecticid') || cat.includes('herbicid') || cat.includes('fungicid') || cat === 'agriculture' || cat === 'plant-growth';
});
