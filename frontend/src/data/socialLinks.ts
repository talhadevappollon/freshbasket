/**
 * Fresh House social accounts for the footer's "Connect with us" row.
 * Fill in a URL to make that icon appear; an empty one stays hidden. (WhatsApp is the live store number.)
 */
export interface SocialLink {
  key: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'x' | 'whatsapp';
  label: string;
  url: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { key: 'facebook', label: 'Facebook', url: '' },
  { key: 'instagram', label: 'Instagram', url: '' },
  { key: 'tiktok', label: 'TikTok', url: '' },
  { key: 'youtube', label: 'YouTube', url: '' },
  { key: 'x', label: 'X (Twitter)', url: '' },
  { key: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/923001234567' },
];
