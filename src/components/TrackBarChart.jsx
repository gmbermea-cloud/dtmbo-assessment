import { TRACK_ORDER, TRACKS } from '../lib/tracks.js';

export default function TrackBarChart({ pct }) {
  return (
    <div className="space-y-4">
      {TRACK_ORDER.map((trackId) => {
        const track = TRACKS[trackId];
        const value = pct[trackId];
        return (
          <div key={trackId}>
            <div className="flex justify-between text-sm font-medium text-navy-800">
              <span>{track.name}</span>
              <span>{value.toFixed(1)}%</span>
            </div>
            <div className="mt-1 h-3 w-full rounded-full bg-navy-50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${value}%`, backgroundColor: track.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
