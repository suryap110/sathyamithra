import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

const QUEUE_KEY = 'sathyamithra_offline_action_queue';

export interface QueuedAction {
  id: string;
  action: 'SAVE_SCHEME' | 'UNSAVE_SCHEME' | 'UPDATE_PROFILE' | 'ELIGIBILITY_DRAFT';
  payload: any;
  timestamp: string;
}

export const syncEngine = {
  async enqueueAction(action: 'SAVE_SCHEME' | 'UNSAVE_SCHEME' | 'UPDATE_PROFILE' | 'ELIGIBILITY_DRAFT', payload: any): Promise<QueuedAction> {
    const item: QueuedAction = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      payload,
      timestamp: new Date().toISOString()
    };

    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const queue: QueuedAction[] = raw ? JSON.parse(raw) : [];
      queue.push(item);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      // Storage error fallback
    }

    return item;
  },

  async getQueue(): Promise<QueuedAction[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async processSync(): Promise<{ synced: number; failed: number }> {
    const queue = await this.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    try {
      const res = await apiClient.post('/sync', {
        last_sync_at: new Date().toISOString(),
        operations: queue
      });

      const acceptedIds: string[] = res.data.accepted_operations || [];
      const remainingQueue = queue.filter(item => !acceptedIds.includes(item.id));
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));

      return {
        synced: acceptedIds.length,
        failed: remainingQueue.length
      };
    } catch (e) {
      return { synced: 0, failed: queue.length };
    }
  }
};
