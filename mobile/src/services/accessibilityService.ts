import AsyncStorage from '@react-native-async-storage/async-storage';

const ELDER_MODE_KEY = 'sathyamithra_elder_mode';
const FONT_SCALE_KEY = 'sathyamithra_font_scale';

export interface AccessibilitySettings {
  isElderMode: boolean;
  fontScale: 'small' | 'default' | 'large' | 'xlarge';
}

export const accessibilityService = {
  async getSettings(): Promise<AccessibilitySettings> {
    try {
      const elder = await AsyncStorage.getItem(ELDER_MODE_KEY);
      const scale = await AsyncStorage.getItem(FONT_SCALE_KEY);
      return {
        isElderMode: elder === 'true',
        fontScale: (scale as any) || 'default'
      };
    } catch {
      return { isElderMode: false, fontScale: 'default' };
    }
  },

  async setElderMode(enabled: boolean): Promise<boolean> {
    await AsyncStorage.setItem(ELDER_MODE_KEY, enabled ? 'true' : 'false');
    return enabled;
  },

  async setFontScale(scale: 'small' | 'default' | 'large' | 'xlarge'): Promise<string> {
    await AsyncStorage.setItem(FONT_SCALE_KEY, scale);
    return scale;
  },

  getFontSizeMultiplier(scale: 'small' | 'default' | 'large' | 'xlarge', isElderMode: boolean): number {
    if (isElderMode) return 1.35;
    switch (scale) {
      case 'small': return 0.9;
      case 'large': return 1.2;
      case 'xlarge': return 1.4;
      default: return 1.0;
    }
  }
};
