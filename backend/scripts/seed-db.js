import { getDatabase, promisifyDb } from '../db/database.js';
import { hashPassword } from '../utils/password.js';
import { generateId } from '../utils/id.js';

async function seed() {
  console.log('Seeding database...');
  try {
    const db = await getDatabase();
    const dbAsync = promisifyDb(db);

    // Create admin user
    const adminId = generateId();
    const adminPassword = await hashPassword('admin123');

    await dbAsync.run(
      'INSERT INTO users (id, email, name, password, is_admin) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'admin@farmingtechshop.com', 'Admin', adminPassword, 1]
    ).catch(() => {
      console.log('   Admin user already exists');
    });

    // Seed sample products
    const products = [
      {
        name: 'Organic Fertilizer',
        category: 'fertilizers',
        price: 450,
        description: 'High-quality organic fertilizer enriched with essential nutrients',
        stock: 100,
        sku: 'ORG-FERT-001',
      },
      {
        name: 'Bio-Insecticide',
        category: 'pesticides',
        price: 320,
        description: 'Natural bio-pesticide effective against common agricultural pests',
        stock: 75,
        sku: 'BIO-PEST-001',
      },
      {
        name: 'Hybrid Vegetable Seeds',
        category: 'seeds',
        price: 250,
        description: 'High-yield hybrid seeds suitable for all seasons',
        stock: 200,
        sku: 'HYB-SEED-001',
      },
      {
        name: 'Garden Spade',
        category: 'tools',
        price: 580,
        description: 'Durable stainless steel garden spade for efficient tilling',
        stock: 50,
        sku: 'GAR-SPADE-001',
      },
      {
        name: 'Soil Testing Kit',
        category: 'equipment',
        price: 1200,
        description: 'Complete soil testing kit to analyze NPK levels',
        stock: 30,
        sku: 'SOIL-TEST-001',
      },
      {
        name: 'Agriculture Gloves',
        category: 'equipment',
        price: 180,
        description: 'Protective farming gloves for safe field work',
        stock: 150,
        sku: 'AGR-GLOVE-001',
      },
    ];

    for (const product of products) {
      try {
        const productId = generateId();
        await dbAsync.run(
          'INSERT INTO products (id, name, category, price, description, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            productId,
            product.name,
            product.category,
            product.price,
            product.description,
            product.stock,
            product.sku,
          ]
        );
        console.log(`   ✓ Added: ${product.name}`);
      } catch (error) {
        console.log(`   A "${product.name}" already exists`);
      }
    }

    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
