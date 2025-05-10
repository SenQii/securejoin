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
  private static getStorageKey(user_id: string): string {
    return `${STORAGE_KEY}_${user_id}`; // will be assgned to the user's session
  }

  // get the data of the user
  private static getAttemptManagerData(user_id: string): AttemptManagerData {
    const key = this.getStorageKey(user_id);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { attempts: 0, lastAttempt: 0 };
  }

  private static saveData(user_id: string, data: AttemptManagerData): void {
    const key = this.getStorageKey(user_id); // ex: securejoin_attempts_limit_{userid}
    localStorage.setItem(key, JSON.stringify(data));
  }

  // check if the user is banned
  public static isBanned(user_id: string): boolean {
    const data = this.getAttemptManagerData(user_id);
    const now = Date.now();

    if (data.bannedUntil && now < data.bannedUntil) {
      const hoursLeft = Math.ceil((data.bannedUntil - now) / (60 * 60 * 1000));
      toast.error(`تم حظرك من النظام لمدة ${hoursLeft} ساعة`);
      return true;
    }

    // rset if ban expired
    if (data.bannedUntil && now >= data.bannedUntil) {
      this.saveData(user_id, { attempts: 0, lastAttempt: 0 });
    }

    return false;
  }

  public static recordAttempt(user_id: string): boolean {
    const data = this.getAttemptManagerData(user_id);
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

    this.saveData(user_id, data);
    return data.attempts >= MAX_ATTEMPTS;
  }

  public static getRemainingAttempts(user_id: string): number {
    const data = this.getAttemptManagerData(user_id);
    return Math.max(0, MAX_ATTEMPTS - data.attempts);
  }

  public static getBanInfo(user_id: string) {
    const data = this.getAttemptManagerData(user_id);
    if (!data.bannedUntil || Date.now() >= data.bannedUntil) return null;

    return {
      bannedUntil: data.bannedUntil,
      remainingMins: (data.bannedUntil - Date.now()) / (1000 * 60 * 60 * 60),
      remainingHours: Math.ceil((data.bannedUntil - Date.now()) / 3600000),
    };
  }
}
