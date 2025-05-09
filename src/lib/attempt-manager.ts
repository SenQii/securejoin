import { toast } from 'react-hot-toast';

interface AttemptManagerData {
  attempts: number;
  lastAttempt: number;
  bannedUntil?: number;
}

// admin may adjust it
const MAX_ATTEMPTS = 5;
const BAN_DURATION = 24 * 60 * 60 * 1000; // 24h >>> milliseconds
const STORAGE_KEY = 'securejoin_attempts_limit';

export class AttemptManager {
  private static getStorageKey(ip: string): string {
    return `${STORAGE_KEY}_${ip}`;
  }

  private static getAttemptManagerData(ip: string): AttemptManagerData {
    const key = this.getStorageKey(ip);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { attempts: 0, lastAttempt: 0 };
  }

  private static saveData(ip: string, data: AttemptManagerData): void {
    const key = this.getStorageKey(ip);
    localStorage.setItem(key, JSON.stringify(data));
  }

  public static isBanned(ip: string): boolean {
    const data = this.getAttemptManagerData(ip);
    const now = Date.now();

    if (data.bannedUntil && now < data.bannedUntil) {
      const hoursLeft = Math.ceil((data.bannedUntil - now) / (60 * 60 * 1000));
      toast.error(`تم حظرك من النظام لمدة ${hoursLeft} ساعة`);
      return true;
    }

    // rset if ban expired
    if (data.bannedUntil && now >= data.bannedUntil) {
      this.saveData(ip, { attempts: 0, lastAttempt: 0 });
    }

    return false;
  }

  public static recordAttempt(ip: string): boolean {
    const data = this.getAttemptManagerData(ip);
    const now = Date.now();

    // Reset attempts if last attempt was more than 24 hours ago
    if (now - data.lastAttempt > BAN_DURATION) {
      data.attempts = 0;
    }

    data.attempts++;
    data.lastAttempt = now;

    if (data.attempts >= MAX_ATTEMPTS) {
      data.bannedUntil = now + BAN_DURATION;
      toast.error('تم تجاوز عدد المحاولات المسموح بها. سيتم حظرك لمدة 24 ساعة');
    }

    this.saveData(ip, data);
    return data.attempts >= MAX_ATTEMPTS;
  }

  public static getRemainingAttempts(ip: string): number {
    const data = this.getAttemptManagerData(ip);
    return Math.max(0, MAX_ATTEMPTS - data.attempts);
  }

  public static getBanInfo(ip: string) {
    const data = this.getAttemptManagerData(ip);
    if (!data.bannedUntil || Date.now() >= data.bannedUntil) return null;

    return {
      bannedUntil: data.bannedUntil,
      remainingMins: (data.bannedUntil - Date.now()) / (1000 * 60 * 60 * 60),
      remainingHours: Math.ceil((data.bannedUntil - Date.now()) / 3600000),
    };
  }
}
