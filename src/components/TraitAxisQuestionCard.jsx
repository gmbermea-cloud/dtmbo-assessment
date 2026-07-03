import ProgressBar from './ProgressBar.jsx';

export default function TraitAxisQuestionCard({ item, index, total, selectedValue, onAnswer, onBack }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ProgressBar current={index + 1} total={total} />

      <p className="mt-10 text-sm font-medium uppercase tracking-wide text-navy-500">
        Pick whichever feels more like you
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onAnswer('A')}
          className={`rounded-md border px-6 py-8 text-left text-lg font-medium leading-relaxed transition-colors ${
            selectedValue === 'A'
              ? 'border-gold-500 bg-gold-50 text-navy-900'
              : 'border-navy-100 bg-white text-navy-800 hover:border-gold-400 hover:bg-gold-50'
          }`}
        >
          {item.statement_a}
        </button>
        <button
          type="button"
          onClick={() => onAnswer('B')}
          className={`rounded-md border px-6 py-8 text-left text-lg font-medium leading-relaxed transition-colors ${
            selectedValue === 'B'
              ? 'border-gold-500 bg-gold-50 text-navy-900'
              : 'border-navy-100 bg-white text-navy-800 hover:border-gold-400 hover:bg-gold-50'
          }`}
        >
          {item.statement_b}
        </button>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-navy-700 underline decoration-navy-100 underline-offset-4"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
