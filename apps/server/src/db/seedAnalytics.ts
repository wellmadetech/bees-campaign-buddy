import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { branches } from './schema/branches.js';
import { campaigns, campaignTypes } from './schema/campaigns.js';
import { users } from './schema/users.js';
import { touchpointEvents, conversions, campaignMetrics } from './schema/analytics.js';
import { eq } from 'drizzle-orm';

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://buddy:buddy_dev@localhost:5432/campaign_buddy';

// --- Deterministic pseudo-random number generator (seeded) ---
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const CHANNELS = ['push', 'email', 'in_app', 'sms', 'whatsapp'] as const;
type Channel = (typeof CHANNELS)[number];

const EVENT_TYPES = ['sent', 'delivered', 'opened', 'clicked'] as const;

const PRODUCTS = [
  { sku: 'BL-001', name: 'Bud Light 24pk' },
  { sku: 'CR-001', name: 'Corona Extra 12pk' },
  { sku: 'MU-001', name: 'Michelob Ultra 18pk' },
  { sku: 'SA-001', name: 'Stella Artois 6pk' },
  { sku: 'GI-001', name: 'Goose Island IPA 12pk' },
  { sku: 'BW-001', name: 'Budweiser 30pk' },
  { sku: 'NB-001', name: 'Natural Light 24pk' },
  { sku: 'SC-001', name: 'Bud Light Seltzer Variety' },
];

const CAMPAIGN_TITLES = [
  'Spring Beer Promo — Bud Light',
  'BEES Rewards Launch Push',
  'Summer Seltzer Blitz',
  'Cinco de Mayo Bundle',
  'Corona Summer Push',
  'Michelob Ultra Fitness Campaign',
  'Stella Artois Date Night',
  'Goose Island Craft Week',
  'Memorial Day Mega Sale',
  'Fourth of July Celebration',
  'Back to School Tailgate',
  'Labor Day Weekend Deals',
  'Oktoberfest Special',
  'Halloween Party Packs',
  'Thanksgiving Host Bundle',
  'Holiday Gift Sets Campaign',
  'New Year Kickoff Promo',
  'Super Bowl Party Push',
  'Valentines Day Pairing',
  'St Patricks Day Green Campaign',
];

// Channel inclusion probability — multi-channel campaigns get higher conversion
const CHANNEL_PROBABILITY: Record<Channel, number> = {
  push: 0.8,
  email: 0.7,
  in_app: 0.4,
  sms: 0.2,
  whatsapp: 0.1,
};

// Conversion rate multipliers based on channel count
const CONVERSION_RATE_BY_CHANNEL_COUNT: Record<number, number> = {
  1: 0.08,
  2: 0.14,
  3: 0.18,
  4: 0.22,
  5: 0.25,
};

// Drop-off rates per event stage
const DROP_OFF = {
  delivered: 0.02, // 98% delivery
  opened: 0.58, // ~40% open rate
  clicked: 0.62, // ~15% CTR from opened
};

async function seedAnalytics() {
  const client = postgres(DATABASE_URL, { max: 1, ssl: DATABASE_URL.includes('render.com') ? 'require' : false });
  const db = drizzle(client);
  const rng = createRng(42);

  console.log('Seeding analytics data...');

  // Fetch existing data
  const allBranches = await db.select().from(branches);
  const allTypes = await db.select().from(campaignTypes);
  const allUsers = await db.select().from(users);

  if (allBranches.length === 0 || allTypes.length === 0 || allUsers.length === 0) {
    console.error('Run base seed first (npm run db:seed)');
    await client.end();
    process.exit(1);
  }

  const dcManager = allUsers.find((u) => u.role === 'dc_manager')!;

  // Create 20 campaigns spread across branches and types
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const campaignRecords: Array<{
    id: string;
    branchId: string;
    channels: Channel[];
    startDate: Date;
    endDate: Date;
  }> = [];

  for (let i = 0; i < 20; i++) {
    const branch = allBranches[i % allBranches.length]!;
    const type = allTypes[i % allTypes.length]!;

    // Spread campaigns across 6 months
    const dayOffset = Math.floor((i / 20) * 180);
    const startDate = new Date(sixMonthsAgo);
    startDate.setDate(startDate.getDate() + dayOffset);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14 + Math.floor(rng() * 14)); // 2-4 weeks

    // Determine channels for this campaign
    const channels: Channel[] = [];
    for (const ch of CHANNELS) {
      if (rng() < CHANNEL_PROBABILITY[ch]) {
        channels.push(ch);
      }
    }
    if (channels.length === 0) channels.push('push'); // at least one

    const [campaign] = await db
      .insert(campaigns)
      .values({
        title: CAMPAIGN_TITLES[i]!,
        description: `Analytics seed campaign ${i + 1}`,
        campaignTypeId: type.id,
        branchId: branch.id,
        createdBy: dcManager.id,
        status: i < 17 ? 'completed' : 'active',
        scheduledStart: startDate,
        scheduledEnd: endDate,
        contentJson: { headline: CAMPAIGN_TITLES[i], body: 'Campaign body content', cta: 'Order Now' },
      })
      .returning();

    campaignRecords.push({
      id: campaign!.id,
      branchId: branch.id,
      channels,
      startDate,
      endDate,
    });
  }

  console.log(`Created 20 analytics campaigns`);

  // Generate POC identifiers
  const pocIds = Array.from({ length: 500 }, (_, i) => `poc-${String(i + 1).padStart(4, '0')}`);

  // Assign POCs to campaigns and generate touchpoint events + conversions
  let totalEvents = 0;
  let totalConversions = 0;

  const eventBatch: Array<{
    campaignId: string;
    branchId: string;
    channel: string;
    eventType: string;
    pocId: string;
    sequencePosition: number;
    occurredAt: Date;
    metadataJson: Record<string, unknown> | null;
  }> = [];

  const conversionBatch: Array<{
    pocId: string;
    campaignId: string;
    branchId: string;
    conversionType: string;
    revenue: string;
    productSku: string;
    productName: string;
    occurredAt: Date;
    attributionJson: Record<string, unknown>;
  }> = [];

  // Pre-aggregate metrics
  const metricsMap = new Map<
    string,
    {
      campaignId: string;
      branchId: string;
      channel: string;
      date: string;
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      conversions: number;
      revenue: number;
    }
  >();

  function getMetricsKey(campaignId: string, channel: string, date: string) {
    return `${campaignId}:${channel}:${date}`;
  }

  function addMetric(
    campaignId: string,
    branchId: string,
    channel: string,
    date: string,
    field: 'sent' | 'delivered' | 'opened' | 'clicked' | 'conversions',
    revenue = 0
  ) {
    const key = getMetricsKey(campaignId, channel, date);
    if (!metricsMap.has(key)) {
      metricsMap.set(key, {
        campaignId,
        branchId,
        channel,
        date,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        conversions: 0,
        revenue: 0,
      });
    }
    const m = metricsMap.get(key)!;
    m[field]++;
    m.revenue += revenue;
  }

  for (const campaign of campaignRecords) {
    // Each campaign reaches 200-400 POCs
    const reachCount = 200 + Math.floor(rng() * 200);
    const startIdx = Math.floor(rng() * (pocIds.length - reachCount));
    const campaignPocs = pocIds.slice(startIdx, startIdx + reachCount);
    const conversionRate =
      CONVERSION_RATE_BY_CHANNEL_COUNT[campaign.channels.length] || 0.1;
    const campaignDurationDays = Math.floor(
      (campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const pocId of campaignPocs) {
      let sequencePos = 0;
      const pocChannelTouches: Array<{ channel: Channel; date: Date }> = [];

      // Each channel in the campaign generates a sequence of events for this POC
      for (const channel of campaign.channels) {
        sequencePos++;
        // Randomize event time within campaign duration
        const eventDay = Math.floor(rng() * Math.max(campaignDurationDays, 1));
        const eventDate = new Date(campaign.startDate);
        eventDate.setDate(eventDate.getDate() + eventDay);
        eventDate.setHours(Math.floor(rng() * 14) + 8); // 8am - 10pm
        const dateStr = eventDate.toISOString().split('T')[0]!;

        // sent — always
        eventBatch.push({
          campaignId: campaign.id,
          branchId: campaign.branchId,
          channel,
          eventType: 'sent',
          pocId,
          sequencePosition: sequencePos,
          occurredAt: eventDate,
          metadataJson: null,
        });
        addMetric(campaign.id, campaign.branchId, channel, dateStr, 'sent');
        totalEvents++;

        // delivered
        if (rng() > DROP_OFF.delivered) {
          const deliveredDate = new Date(eventDate.getTime() + 60000); // +1min
          eventBatch.push({
            campaignId: campaign.id,
            branchId: campaign.branchId,
            channel,
            eventType: 'delivered',
            pocId,
            sequencePosition: sequencePos,
            occurredAt: deliveredDate,
            metadataJson: null,
          });
          addMetric(campaign.id, campaign.branchId, channel, dateStr, 'delivered');
          totalEvents++;

          // opened
          if (rng() > DROP_OFF.opened) {
            const openedDate = new Date(deliveredDate.getTime() + rng() * 3600000 * 4); // within 4hrs
            eventBatch.push({
              campaignId: campaign.id,
              branchId: campaign.branchId,
              channel,
              eventType: 'opened',
              pocId,
              sequencePosition: sequencePos,
              occurredAt: openedDate,
              metadataJson: null,
            });
            addMetric(campaign.id, campaign.branchId, channel, dateStr, 'opened');
            totalEvents++;

            // clicked
            if (rng() > DROP_OFF.clicked) {
              const clickedDate = new Date(openedDate.getTime() + rng() * 600000); // within 10min
              eventBatch.push({
                campaignId: campaign.id,
                branchId: campaign.branchId,
                channel,
                eventType: 'clicked',
                pocId,
                sequencePosition: sequencePos,
                occurredAt: clickedDate,
                metadataJson: null,
              });
              addMetric(campaign.id, campaign.branchId, channel, dateStr, 'clicked');
              totalEvents++;
            }
          }
        }

        pocChannelTouches.push({ channel, date: eventDate });
      }

      // Determine conversion
      if (rng() < conversionRate) {
        const product = PRODUCTS[Math.floor(rng() * PRODUCTS.length)]!;
        const revenue = 50 + rng() * 450; // $50 - $500
        const lastTouch = pocChannelTouches[pocChannelTouches.length - 1]!;
        const convDate = new Date(lastTouch.date.getTime() + rng() * 86400000 * 2); // within 2 days of last touch
        const dateStr = convDate.toISOString().split('T')[0]!;

        // Compute position-based attribution
        const attribution: Record<string, number> = {};
        const touchCount = pocChannelTouches.length;
        for (let t = 0; t < touchCount; t++) {
          const ch = pocChannelTouches[t]!.channel;
          let weight: number;
          if (touchCount === 1) {
            weight = 1.0;
          } else if (t === 0) {
            weight = 0.4;
          } else if (t === touchCount - 1) {
            weight = 0.4;
          } else {
            weight = 0.2 / (touchCount - 2);
          }
          attribution[ch] = (attribution[ch] || 0) + weight;
        }

        conversionBatch.push({
          pocId,
          campaignId: campaign.id,
          branchId: campaign.branchId,
          conversionType: rng() < 0.7 ? 'order' : rng() < 0.5 ? 'add_to_cart' : 'page_visit',
          revenue: revenue.toFixed(2),
          productSku: product.sku,
          productName: product.name,
          occurredAt: convDate,
          attributionJson: attribution,
        });

        // Add to metrics
        const primaryChannel = campaign.channels[0]!;
        addMetric(campaign.id, campaign.branchId, primaryChannel, dateStr, 'conversions', revenue);

        totalConversions++;
      }
    }
  }

  // Insert events in batches of 500
  console.log(`Inserting ${eventBatch.length} touchpoint events...`);
  for (let i = 0; i < eventBatch.length; i += 500) {
    const batch = eventBatch.slice(i, i + 500);
    await db.insert(touchpointEvents).values(batch as any);
  }

  // Insert conversions in batches of 500
  console.log(`Inserting ${conversionBatch.length} conversions...`);
  for (let i = 0; i < conversionBatch.length; i += 500) {
    const batch = conversionBatch.slice(i, i + 500);
    await db.insert(conversions).values(batch as any);
  }

  // Insert campaign metrics
  const metricsValues = Array.from(metricsMap.values()).map((m) => ({
    ...m,
    revenue: m.revenue.toFixed(2),
  }));
  console.log(`Inserting ${metricsValues.length} campaign metrics rows...`);
  for (let i = 0; i < metricsValues.length; i += 500) {
    const batch = metricsValues.slice(i, i + 500);
    await db.insert(campaignMetrics).values(batch as any);
  }

  console.log(`Analytics seed complete!`);
  console.log(`  Campaigns: 20`);
  console.log(`  POCs: 500`);
  console.log(`  Touchpoint events: ${totalEvents}`);
  console.log(`  Conversions: ${totalConversions}`);
  console.log(`  Metrics rows: ${metricsValues.length}`);

  await client.end();
}

seedAnalytics().catch((err) => {
  console.error('Analytics seed failed:', err);
  process.exit(1);
});
