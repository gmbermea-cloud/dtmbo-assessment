import ProgressBar from './ProgressBar.jsx';

const OPTIONS = [
  { value: 1, label: 'Definitely Not Like Me' },
  { value: 2, label: 'Not Like Me' },
  { value: 3, label: 'Like Me' },
  { value: 4, label: 'Definitely Like Me' },
];

export default function QuestionCard({ item, index, total, selectedValue, onAnswer, onBack }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <ProgressBar current={index + 1} total={total} />

      <p className="mt-10 text-xl font-medium leading-relaxed text-navy-900">{item.item_text}</p>

      <div className="mt-8 space-y-3">
        {OPTIONS.map((option) => {
          const selected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnswer(option.value)}
              className={`w-full rounded-md border px-4 py-3 text-left font-medium transition-colors ${
                selected
                  ? 'border-gold-500 bg-gold-50 text-navy-900'
                  : 'border-navy-100 bg-white text-navy-800 hover:border-gold-400 hover:bg-gold-50'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={index === 0}
          className="text-sm font-medium text-navy-700 underline decoration-navy-100 underline-offset-4 disabled:cursor-not-allowed disabled:text-navy-100 disabled:no-underline"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
