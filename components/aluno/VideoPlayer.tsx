'use client';

import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface Props {
  lessonId: string;
  initialCompleted: boolean;
}

export default function VideoPlayer({ lessonId, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: !completed }),
      });
      if (res.ok) setCompleted(!completed);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1.125rem', borderRadius: 999, border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: '0.875rem', flexShrink: 0, transition: 'all 0.2s',
        background: completed ? 'rgba(22,163,74,0.10)' : 'rgba(96,108,56,0.08)',
        color: completed ? '#166534' : 'var(--seiva-medium)',
      }}
      title={completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
    >
      {completed
        ? <><CheckCircle size={16} /> Concluída</>
        : <><Circle size={16} /> Marcar como concluída</>
      }
    </button>
  );
}
