import { useEffect, useState } from 'react';
import { useObserverStore } from '../core/ObserverState';

export function EmbodimentBanner() {
  const embodimentTransition = useObserverStore((s) => s.embodimentTransition);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (embodimentTransition === 'entering') {
      setMessage('Walking the human world');
      setVisible(true);
    } else if (embodimentTransition === 'exiting') {
      setMessage('Returning to the cosmos');
      setVisible(true);
    } else {
      setVisible(false);
    }

    if (embodimentTransition !== 'none') {
      const t = window.setTimeout(() => {
        useObserverStore.setState({ embodimentTransition: 'none' });
        setVisible(false);
      }, 800);
      return () => window.clearTimeout(t);
    }
  }, [embodimentTransition]);

  if (!visible) return null;

  return <div className="embodiment-banner">{message}</div>;
}
