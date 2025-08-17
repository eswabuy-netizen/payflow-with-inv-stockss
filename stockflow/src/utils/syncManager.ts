import { getQueue, clearQueue, OfflineAction } from './offlineQueue';
import { salesService } from '../services/salesService';
import { restockService } from '../services/restockService';
import { productService } from '../services/productService';

export async function syncQueuedActions(companyId: string, onConflict?: (msg: string) => void) {
  const queue = await getQueue();
  for (const action of queue) {
    try {
      if (action.type === 'sale') {
        // Check product stock before processing
        let canProcess = true;
        for (const item of action.payload.items) {
          const products = await productService.getProducts(companyId);
          const product = products.find(p => p.id === item.productId);
          if (!product || product.quantity < item.quantity) {
            canProcess = false;
            if (onConflict) onConflict(`Sale for ${item.productName} skipped: insufficient stock.`);
            break;
          }
        }
        if (!canProcess) continue;
        
        // Add companyId to the sale payload if not present
        const salePayload = {
          ...action.payload,
          companyId: action.payload.companyId || companyId
        };
        await salesService.processSale(salePayload);
      } else if (action.type === 'restock') {
        // Add companyId to the restock payload if not present
        const restockPayload = {
          ...action.payload,
          companyId: action.payload.companyId || companyId
        };
        await restockService.addRestock(restockPayload);
      }
      // Optionally: notify user of successful sync
    } catch (err) {
      // Optionally: handle sync error (e.g., keep in queue)
      console.error('Sync error:', err);
      return false;
    }
  }
  await clearQueue();
  return true;
}

export function setupSyncOnReconnect(companyId: string, onConflict?: (msg: string) => void) {
  window.addEventListener('online', () => {
    syncQueuedActions(companyId, onConflict);
  });
} 