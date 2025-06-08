import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products } from './shared/schema';

async function testDatabase() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, {
    ssl: 'require',
    max: 1
  });
  
  const db = drizzle(client);

  try {
    console.log('Testing database connection...');
    
    // Try to insert a test product
    const result = await db.insert(products).values({
      name: 'Test Wine',
      brand: 'Test Brand',
      netVolume: '750ml',
      vintage: '2023',
      wineType: 'Red',
      sugarContent: 'Dry',
      appellation: 'Test Region',
      sku: 'TEST001'
    }).returning();

    console.log('Successfully inserted product:', result);

    // Try to fetch all products
    const allProducts = await db.select().from(products);
    console.log('All products:', allProducts);

  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await client.end();
  }
}

testDatabase(); 