import { useEffect, useState } from 'react';
import TrackBarChart from './TrackBarChart.jsx';

export default function FirmDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/firm-summary')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load firm results right now.');
        return res.json();
      })
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-navy-800">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-navy-500">Loading firm results…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Firm-wide</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">DTPBO Blend</h1>

      {summary.count === 0 ? (
        <p className="mt-4 text-navy-700">No assessments have been completed yet.</p>
      ) : (
        <>
          <p className="mt-3 text-navy-700">
            Average track blend across {summary.count} completed{' '}
            {summary.count === 1 ? 'assessment' : 'assessments'}.
          </p>
          <div className="mt-10">
            <TrackBarChart pct={summary.pct} />
          </div>
        </>
      )}
    </div>
  );
}
