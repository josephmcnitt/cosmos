import { useState } from 'react';
import {
  buildVideoBrief,
  copyBriefPrompt,
  downloadBrief,
  type BriefDurationSec,
} from '../export/index';

const DURATION_OPTIONS: BriefDurationSec[] = [45, 60, 90];

interface VideoBriefExportProps {
  eventId: string;
}

export function VideoBriefExport({ eventId }: VideoBriefExportProps) {
  const [duration, setDuration] = useState<BriefDurationSec>(60);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [promptFallback, setPromptFallback] = useState<string | null>(null);

  const handleExport = async () => {
    const brief = buildVideoBrief(eventId, { duration });
    if (!brief) {
      setExportStatus('Could not build brief for this event.');
      return;
    }

    downloadBrief(brief);
    const copied = await copyBriefPrompt(brief);
    setPromptFallback(copied ? null : brief.openMontage.cursorPrompt);
    setExportStatus(
      copied
        ? `Downloaded ${brief.metadata.eventId}-brief.json — OpenMontage prompt copied to clipboard.`
        : `Downloaded brief — copy the prompt below (clipboard blocked).`,
    );
  };

  return (
    <div className="event-detail-export">
      <div className="event-detail-export-label">Video export (OpenMontage)</div>
      <div className="event-detail-export-durations">
        {DURATION_OPTIONS.map((sec) => (
          <button
            key={sec}
            type="button"
            className={`event-detail-export-chip${duration === sec ? ' active' : ''}`}
            onClick={() => setDuration(sec)}
          >
            {sec}s
          </button>
        ))}
      </div>
      <button type="button" className="event-detail-export-btn" onClick={() => void handleExport()}>
        Export video brief
      </button>
      {exportStatus && <p className="event-detail-export-status">{exportStatus}</p>}
      {promptFallback && (
        <textarea
          className="event-detail-export-prompt"
          readOnly
          value={promptFallback}
          rows={8}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}
