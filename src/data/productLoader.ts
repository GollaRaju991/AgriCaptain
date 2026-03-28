import { products, type Product } from './products';
import { seedsProducts } from './seeds';
import { pesticideProducts } from './pesticides';
import { farmToolsProducts } from './farmTools';

export const getProductsByCategory = (category: string): Product[] => {
  switch (category) {
    case 'seeds':
      return seedsProducts;
    case 'pesticides':
    case 'agriculture':
    case 'plant-growth':
      return pesticideProducts;
    case 'farm-tools':
    case 'tools':
    case 'equipment':
      return farmToolsProducts;
    default:
      return products;
  }
};

export const getAllProducts = (): Product[] => products;
