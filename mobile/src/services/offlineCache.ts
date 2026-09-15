import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  SCHEMES: 'sathyamithra_cache_schemes',
  RECOMMENDATIONS: 'sathyamithra_cache_recommendations',
  SAVED_SCHEMES: 'sathyamithra_cache_saved_schemes',
  USER_PROFILE: 'sathyamithra_cache_user_profile',
  FAQS: 'sathyamithra_cache_faqs',
  OFFLINE_QUEUE: 'sathyamithra_cache_offline_queue'
};

export const offlineCache = {
  async saveSchemes(schemes: any[]) {
    await AsyncStorage.setItem(CACHE_KEYS.SCHEMES, JSON.stringify({
      timestamp: Date.now(),
      data: schemes
    }));
  },

  async getSchemes(): Promise<any[] | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEYS.SCHEMES);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data;
    } catch {
      return null;
    }
  },

  async saveRecommendations(recs: any[]) {
    await AsyncStorage.setItem(CACHE_KEYS.RECOMMENDATIONS, JSON.stringify({
      timestamp: Date.now(),
      data: recs
    }));
  },

  async getRecommendations(): Promise<any[] | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEYS.RECOMMENDATIONS);
      if (!raw) return null;
      return JSON.parse(raw).data;
    } catch {
      return null;
    }
  },

  async toggleSavedScheme(schemeId: string, schemeData?: any): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEYS.SAVED_SCHEMES);
      let list: string[] = raw ? JSON.parse(raw) : [];
      if (list.includes(schemeId)) {
        list = list.filter(id => id !== schemeId);
      } else {
        list.push(schemeId);
      }
      await AsyncStorage.setItem(CACHE_KEYS.SAVED_SCHEMES, JSON.stringify(list));
      return list;
    } catch {
      return [];
    }
  },

  async getSavedSchemeIds(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEYS.SAVED_SCHEMES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async clearUserCache() {
    await AsyncStorage.multiRemove([
      CACHE_KEYS.SCHEMES,
      CACHE_KEYS.RECOMMENDATIONS,
      CACHE_KEYS.SAVED_SCHEMES,
      CACHE_KEYS.USER_PROFILE,
      CACHE_KEYS.OFFLINE_QUEUE
    ]);
  }
};
