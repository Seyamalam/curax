import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { labs, labTests } from './schema';

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

async function seedLabsAndTests() {
  // Seed labs
  const labData = [
    {
      name: 'City Lab',
      address: '123 Main St',
      timeSlots: [
        '2024-06-10T09:00:00',
        '2024-06-10T10:00:00',
        '2024-06-10T11:00:00',
      ],
    },
    {
      name: 'Health Diagnostics',
      address: '456 Oak Ave',
      timeSlots: [
        '2024-06-10T14:00:00',
        '2024-06-10T15:00:00',
        '2024-06-10T16:00:00',
      ],
    },
  ];

  // Insert labs and get their IDs
  const insertedLabs = [];
  for (const lab of labData) {
    const [inserted] = await db.insert(labs).values({
      name: lab.name,
      address: lab.address,
      timeSlots: lab.timeSlots,
    }).returning();
    insertedLabs.push(inserted);
  }

  // Seed lab tests for each lab
  const testData = [
    // For City Lab
    [
      { name: 'Blood Test', type: 'blood', price: 50 },
      { name: 'Cholesterol Test', type: 'blood', price: 40 },
      { name: 'X-Ray', type: 'imaging', price: 100 },
      { name: 'CT Scan', type: 'imaging', price: 200 },
      { name: 'MRI', type: 'imaging', price: 300 },
      { name: 'EKG', type: 'electrocardiogram', price: 80 },
      { name: 'Holter Monitor', type: 'electrocardiogram', price: 120 },
      { name: 'Stress Test', type: 'electrocardiogram', price: 100 },
      { name: 'Echocardiogram', type: 'echocardiogram', price: 150 },
      { name: 'Holter Monitor', type: 'electrocardiogram', price: 120 },
      
    ],
    // For Health Diagnostics
    [
      { name: 'Blood Test', type: 'blood', price: 55 },
      { name: 'MRI', type: 'imaging', price: 300 },
      { name: 'Urine Test', type: 'blood', price: 30 },
      { name: 'CT Scan', type: 'imaging', price: 200 },
      { name: 'MRI', type: 'imaging', price: 300 },
      { name: 'Ultrasound', type: 'imaging', price: 150 },
      { name: 'EKG', type: 'electrocardiogram', price: 80 },
      { name: 'Stress Test', type: 'electrocardiogram', price: 100 },
      
    ],
  ];

  for (let i = 0; i < insertedLabs.length; i++) {
    const lab = insertedLabs[i];
    for (const test of testData[i]) {
      await db.insert(labTests).values({
        name: test.name,
        type: test.type,
        price: test.price,
        labId: lab.id,
      });
    }
  }

  console.log('Seeded labs and lab tests.');
}

seedLabsAndTests().catch((err) => {
  console.error(err);
  process.exit(1);
}); 