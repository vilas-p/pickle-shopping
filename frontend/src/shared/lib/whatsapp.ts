import { config } from "./config";

interface OrderLinkOptions {
  productName?: string;
  quantity?: number;
  customMessage?: string;
}

export function whatsappOrderLink(opts: OrderLinkOptions): string {
  let text = `Hello, I'd like to bring home a jar from ${config.brand.shortName} Pickles.`;
  if (opts.productName) {
    text += `\n\nPickle: ${opts.productName}`;
    if (opts.quantity) text += `\nQuantity: ${opts.quantity}`;
  }
  if (opts.customMessage) text += `\n\n${opts.customMessage}`;
  text += `\n\nPlease help me choose the right jar if needed.`;
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function whatsappGenericLink(message?: string): string {
  const text = message ?? `Hello, I have a question about ${config.brand.shortName} Pickles.`;
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function instagramLink(): string {
  // return `https://www.instagram.com/${config.instagramHandle}`;
  return `https://www.instagram.com/appa_ammas_pickles/`;
}
