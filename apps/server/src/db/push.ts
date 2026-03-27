import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://buddy:buddy_dev@localhost:5432/campaign_buddy';
const sql = postgres(DATABASE_URL, { max: 1, ssl: DATABASE_URL.includes('render.com') ? 'require' : false });

async function push() {
  console.log('Creating database schema...');

  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  // Enums
  await sql`DO $$ BEGIN CREATE TYPE user_role AS ENUM ('wholesaler_manager','content_creator','dc_manager'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE campaign_type_code AS ENUM ('ad_hoc_sales','ad_hoc_operational','opt_in','edge_algo','lifecycle'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE campaign_status AS ENUM ('in_progress','scheduled','active','completed','needs_attention','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE request_status AS ENUM ('in_review','denied','accepted'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE orchestration_step AS ENUM ('validate','match_template','discover_assets','create_audience','create_braze_draft'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE job_status AS ENUM ('pending','running','success','failed','retrying'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE org_type AS ENUM ('bees_internal','wholesaler'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE invite_status AS ENUM ('pending','accepted','expired','revoked'); EXCEPTION WHEN duplicate_object THEN null; END $$`;
  await sql`DO $$ BEGIN CREATE TYPE touchpoint_channel AS ENUM ('push','email','in_app','content_card','sms','whatsapp'); EXCEPTION WHEN duplicate_object THEN null; END $$`;

  // Tables
  await sql`CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    region VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bees_sso_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS user_branches (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (user_id, branch_id)
  )`;

  await sql`CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    campaign_type_id UUID,
    braze_template_id VARCHAR(255),
    channel VARCHAR(50) NOT NULL,
    content_json JSONB NOT NULL,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS campaign_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code campaign_type_code NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    default_template_id UUID REFERENCES templates(id),
    is_active BOOLEAN NOT NULL DEFAULT true
  )`;

  await sql`CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type_id UUID NOT NULL REFERENCES campaign_types(id),
    template_id UUID REFERENCES templates(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    status campaign_status NOT NULL DEFAULT 'in_progress',
    parent_id UUID,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    content_json JSONB,
    creative_json JSONB,
    products_json JSONB,
    braze_campaign_id VARCHAR(255),
    braze_segment_id VARCHAR(255),
    braze_status VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS campaign_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    from_status campaign_status,
    to_status campaign_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    criteria_json JSONB NOT NULL,
    braze_segment_id VARCHAR(255),
    estimated_size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS orchestration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    step orchestration_step NOT NULL,
    status job_status NOT NULL DEFAULT 'pending',
    attempt INTEGER NOT NULL DEFAULT 0,
    input_json JSONB,
    output_json JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type org_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    invited_by UUID,
    token VARCHAR(255) NOT NULL UNIQUE,
    status invite_status NOT NULL DEFAULT 'pending',
    message TEXT,
    branch_ids TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS touchpoint_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    channel touchpoint_channel NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    poc_id VARCHAR(255) NOT NULL,
    sequence_position INTEGER NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poc_id VARCHAR(255) NOT NULL,
    campaign_id UUID REFERENCES campaigns(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    conversion_type VARCHAR(50) NOT NULL,
    revenue NUMERIC(12,2),
    product_sku VARCHAR(100),
    product_name VARCHAR(255),
    occurred_at TIMESTAMPTZ NOT NULL,
    attribution_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS campaign_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    channel touchpoint_channel NOT NULL,
    date DATE NOT NULL,
    sent INTEGER NOT NULL DEFAULT 0,
    delivered INTEGER NOT NULL DEFAULT 0,
    opened INTEGER NOT NULL DEFAULT 0,
    clicked INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(campaign_id, channel, date)
  )`;

  console.log('Schema created successfully.');
  await sql.end();
}

push().catch((err) => {
  console.error('Schema push failed:', err);
  process.exit(1);
});
