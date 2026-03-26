// Re-export from unified product catalogue – no separate mock data needed
import { products, type Product } from './products';

export type MockProduct = Product;

// Map to legacy shape expected by some components
export const mockProducts: MockProduct[] = products;
