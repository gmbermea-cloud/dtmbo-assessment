export default function TraitAxisTransition({ onContinue }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Part 2</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-800">A quick structural check</h1>
      <p className="mt-4 text-navy-700 leading-relaxed">
        16 quick either/or choices — about 2 minutes. Pick whichever statement feels more like
        you; there&apos;s no right answer.
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 w-full rounded-md bg-navy-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-800"
      >
        Continue
      </button>
    </div>
  );
}
