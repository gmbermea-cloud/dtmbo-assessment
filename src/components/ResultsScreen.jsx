import { TRACKS } from '../lib/tracks.js';
import TrackBarChart from './TrackBarChart.jsx';

function differentiationHeadline(scored) {
  const dominantName = TRACKS[scored.dominant].name;
  const secondaryName = TRACKS[scored.secondary].name;

  switch (scored.differentiationTier) {
    case 'strong':
      return `Strongly ${dominantName}-dominant`;
    case 'leaning':
      return `${dominantName}-leaning, with ${secondaryName} as a clear secondary strength`;
    case 'low_differentiation':
    case 'blended':
    default:
      return `Closely blended between ${dominantName} and ${secondaryName}`;
  }
}

export default function ResultsScreen({ scored }) {
  const dominant = TRACKS[scored.dominant];
  const secondary = TRACKS[scored.secondary];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Your result</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">{dominant.name}</h1>
      <p className="mt-3 text-navy-700 leading-relaxed">{dominant.description}</p>

      <p className="mt-6 font-medium text-navy-800">
        Secondary track: <span style={{ color: secondary.color }}>{secondary.name}</span>
      </p>

      <p className="mt-2 text-navy-700">{differentiationHeadline(scored)}</p>

      {scored.lowDifferentiation && (
        <p className="mt-4 rounded-md bg-navy-50 px-4 py-3 text-sm text-navy-700">
          Your answers were very consistent across all questions — this result may be less
          distinct than usual.
        </p>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-navy-900">Your full track breakdown</h2>
        <div className="mt-4">
          <TrackBarChart pct={scored.pct} />
        </div>
      </div>

      <p className="mt-10 text-sm font-medium text-red-600">
        Please forward a screenshot of your result to Gabriella at gmbermea@gmail.com.
      </p>
    </div>
  );
}
