import { IEventBus, RuntimeEventType, IOrchestratorEvent, EventHandler } from './types.js';

export class EventBus implements IEventBus {
  private readonly listeners = new Map<RuntimeEventType, Set<EventHandler<any>>>();

  public async publish<T>(event: IOrchestratorEvent<T>): Promise<void> {
    const handlers = this.listeners.get(event.type);
    if (!handlers) return;

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Error in handler for event "${event.type}":`, err);
      }
    });

    await Promise.all(promises);
  }

  public subscribe<T>(type: RuntimeEventType, handler: EventHandler<T>): void {
    let handlers = this.listeners.get(type);
    if (!handlers) {
      handlers = new Set<EventHandler<any>>();
      this.listeners.set(type, handlers);
    }
    handlers.add(handler);
  }
}
