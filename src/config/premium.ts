export const premiumConfig = {
  priceBdt: 100,
  durationDays: 30,
  whatsappDisplay: "01626224878",
  whatsappE164: "8801626224878",
  whatsappMessage: "আসসালামু আলাইকুম, আমি PoraSathi Premium (৳100/30 দিন) সম্পর্কে যোগাযোগ করছি।",
} as const;

export function getPremiumWhatsAppUrl(): string {
  return `https://wa.me/${premiumConfig.whatsappE164}?text=${encodeURIComponent(premiumConfig.whatsappMessage)}`;
}
