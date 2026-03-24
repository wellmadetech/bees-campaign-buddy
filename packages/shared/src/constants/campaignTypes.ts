export const CampaignTypeCode = {
  AD_HOC_SALES: 'ad_hoc_sales',
  AD_HOC_OPERATIONAL: 'ad_hoc_operational',
  OPT_IN: 'opt_in',
  EDGE_ALGO: 'edge_algo',
  LIFECYCLE: 'lifecycle',
} as const;

export type CampaignTypeCode = (typeof CampaignTypeCode)[keyof typeof CampaignTypeCode];

export const CAMPAIGN_TYPE_LABELS: Record<CampaignTypeCode, string> = {
  ad_hoc_sales: 'Ad-hoc Sales',
  ad_hoc_operational: 'Ad-hoc Operational',
  opt_in: 'Opt-in',
  edge_algo: 'Edge-Algo',
  lifecycle: 'Lifecycle',
};

export const CAMPAIGN_TYPE_DESCRIPTIONS: Record<CampaignTypeCode, string> = {
  ad_hoc_sales: 'Regular commercial campaigns to advertise a product or brand',
  ad_hoc_operational: 'Holiday closures, reroutes, price increases, delivery date changes',
  opt_in: 'Pre-designed marketing campaigns from BEES that wholesalers subscribe to',
  edge_algo: 'Automatic campaigns driven by Edge tasks / algo-recommended products',
  lifecycle: 'NPS surveys, Order Viz, product launches',
};
