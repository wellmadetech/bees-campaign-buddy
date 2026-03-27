import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { branches } from './schema/branches.js';
import { users, userBranches } from './schema/users.js';
import { campaignTypes } from './schema/campaigns.js';

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://buddy:buddy_dev@localhost:5432/campaign_buddy';

async function seed() {
  const client = postgres(DATABASE_URL, { max: 1, ssl: DATABASE_URL.includes('render.com') ? 'require' : false });
  const db = drizzle(client);

  console.log('Seeding database...');

  // Seed branches
  const [branch1, branch2, branch3] = await db
    .insert(branches)
    .values([
      { name: 'Northeast Distribution', code: 'NE-001', region: 'Northeast' },
      { name: 'Southeast Distribution', code: 'SE-001', region: 'Southeast' },
      { name: 'West Coast Distribution', code: 'WC-001', region: 'West' },
    ])
    .returning();

  console.log('Seeded 3 branches');

  // Seed campaign types
  await db.insert(campaignTypes).values([
    {
      code: 'ad_hoc_sales',
      displayName: 'Ad-hoc Sales',
      description: 'Regular commercial campaigns to advertise a product or brand',
    },
    {
      code: 'ad_hoc_operational',
      displayName: 'Ad-hoc Operational',
      description: 'Holiday closures, reroutes, price increases, delivery date changes',
    },
    {
      code: 'opt_in',
      displayName: 'Opt-in',
      description: 'Pre-designed marketing campaigns from BEES that wholesalers subscribe to',
    },
    {
      code: 'edge_algo',
      displayName: 'Edge-Algo',
      description: 'Automatic campaigns driven by Edge tasks / algo-recommended products',
    },
    {
      code: 'lifecycle',
      displayName: 'Lifecycle',
      description: 'NPS surveys, Order Viz, product launches',
    },
  ]);

  console.log('Seeded 5 campaign types');

  // Seed test users
  const [dcManager] = await db
    .insert(users)
    .values([
      {
        besSsoId: 'sso-dc-manager-001',
        email: 'dc.manager@bees.com',
        displayName: 'Dana Campbell',
        role: 'dc_manager',
      },
      {
        besSsoId: 'sso-wholesaler-001',
        email: 'wholesaler@bees.com',
        displayName: 'Walter Smith',
        role: 'wholesaler_manager',
      },
      {
        besSsoId: 'sso-creator-001',
        email: 'creator@bees.com',
        displayName: 'Carmen Rodriguez',
        role: 'content_creator',
      },
    ])
    .returning();

  // Assign branches to users
  const allUsers = await db.select().from(users);
  for (const user of allUsers) {
    await db.insert(userBranches).values({
      userId: user.id,
      branchId: branch1!.id,
      isPrimary: true,
    });
    if (user.role === 'dc_manager') {
      await db.insert(userBranches).values([
        { userId: user.id, branchId: branch2!.id, isPrimary: false },
        { userId: user.id, branchId: branch3!.id, isPrimary: false },
      ]);
    }
  }

  console.log('Seeded 3 users with branch assignments');
  console.log('Seed complete!');

  await client.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
