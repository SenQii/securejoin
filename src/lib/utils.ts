import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const avaliablePlatforms = ['https://chat.whatsapp.com/', 't.me', 'ig.me'];

export const validateUrl = (url: string) => {
  return avaliablePlatforms.some((platform) => url.includes(platform));
};
