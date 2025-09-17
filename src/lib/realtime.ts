// Basit realtime utilities

export type RealtimeEvent = {
  id: string;
  type: string;
  payload: any;
  ts: number;
};

// Basit event publish
export function publish(type: string, payload: any) {
  const evt: RealtimeEvent = {
    id: Math.random().toString(36).slice(2),
    type,
    payload,
    ts: Date.now(),
  };
  
  // Demo için console'a log
  console.log('Realtime event:', evt);
}

// Basit event subscribe (demo için)
export function subscribe(handler: (evt: RealtimeEvent) => void) {
  // Demo için basit implementation
  return () => {
    console.log('Unsubscribed from realtime events');
  };
}