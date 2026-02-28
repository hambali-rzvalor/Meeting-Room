import 'dotenv/config';
import { db } from '../src/db';
import { rooms, users } from '../src/db/schema';

async function seed() {
  console.log('Seeding database...');

  // Create demo users
  const [adminUser, employeeUser] = await db
    .insert(users)
    .values([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
      {
        name: 'Employee User',
        email: 'employee@example.com',
        role: 'employee',
      },
    ])
    .returning();

  console.log('Created users:', adminUser, employeeUser);

  // Create demo rooms
  const demoRooms = [
    {
      name: 'Conference Room A',
      capacity: 10,
      location: 'Floor 1, Building A',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      isActive: true,
    },
    {
      name: 'Meeting Room B',
      capacity: 6,
      location: 'Floor 2, Building A',
      imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      isActive: true,
    },
    {
      name: 'Board Room',
      capacity: 20,
      location: 'Floor 3, Building B',
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41e157d4430c?w=800',
      isActive: true,
    },
    {
      name: 'Huddle Space',
      capacity: 4,
      location: 'Floor 1, Building C',
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
      isActive: true,
    },
    {
      name: 'Training Room',
      capacity: 30,
      location: 'Floor 2, Building D',
      imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800',
      isActive: true,
    },
  ];

  const createdRooms = await db.insert(rooms).values(demoRooms).returning();
  console.log('Created rooms:', createdRooms);

  console.log('Seeding completed successfully!');
  console.log('\nDemo users:');
  console.log('- Admin: admin@example.com');
  console.log('- Employee: employee@example.com');
  console.log('\nDemo rooms:', demoRooms.map((r) => r.name).join(', '));
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
