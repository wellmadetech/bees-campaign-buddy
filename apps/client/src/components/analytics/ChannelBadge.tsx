import type { TouchpointChannel } from '@campaignbuddy/shared';

const CHANNEL_CONFIG: Record<TouchpointChannel, { label: string; bg: string; text: string }> = {
  push: { label: 'Push', bg: 'bg-blue-100', text: 'text-blue-700' },
  email: { label: 'Email', bg: 'bg-green-100', text: 'text-green-700' },
  in_app: { label: 'In-App', bg: 'bg-purple-100', text: 'text-purple-700' },
  content_card: { label: 'Content Card', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  sms: { label: 'SMS', bg: 'bg-orange-100', text: 'text-orange-700' },
  whatsapp: { label: 'WhatsApp', bg: 'bg-teal-100', text: 'text-teal-700' },
};

export function channelLabel(channel: TouchpointChannel): string {
  return CHANNEL_CONFIG[channel]?.label || channel;
}

export function channelColor(channel: TouchpointChannel): string {
  return CHANNEL_CONFIG[channel]?.bg || 'bg-gray-100';
}

export default function ChannelBadge({ channel }: { channel: TouchpointChannel }) {
  const config = CHANNEL_CONFIG[channel] || { label: channel, bg: 'bg-gray-100', text: 'text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
