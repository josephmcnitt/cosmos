import { useEffect, useState } from 'react';
import { worldEvents } from '../core/world/WorldEvents';

export function SenseWhisper() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return worldEvents.subscribe((event) => {
      if (event.type === 'sense/trigger') {
        setMessage(event.message);
        window.setTimeout(() => setMessage(null), 5000);
      }
    });
  }, []);

  if (!message) return null;

  return (
    <div className="sense-whisper ui-panel" data-testid="sense-whisper">
      {message}
    </div>
  );
}
