// Grid orientation note: the addendum's written anchor positions
// ("Design top-left... Technical bottom-left... Management right side")
// are internally inconsistent with its own scoring math in Section 4 (Design
// and Technical differ only on axis 1, so they can't both sit on the same
// side; Management is decided by axis 2 alone, so it can't be tied to a
// specific side of axis 1). This lays the grid out to match the scoring
// logic instead: X = axis 1 (Concrete -> Conceptual), Y = axis 2
// (People-focus -> Content-focus). Design = top-right, Technical = top-left,
// Management = the entire bottom half. Flag per Section 8: this is a v1,
// unvalidated instrument — revisit the visual spec after piloting.

export default function TraitAxisResults({ scored }) {
  const dotLeft = scored.axis1Normalized; // 0-100, 0 = Concrete, 100 = Conceptual
  const dotTop = 100 - scored.axis2Normalized; // inverted: CSS top grows downward

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Part 2 result</p>
      <h1 className="mt-2 text-3xl font-bold text-navy-900">{scored.quadrantLean}</h1>
      <p className="mt-3 text-navy-700 leading-relaxed">{scored.headline}</p>

      <div className="mt-10">
        <div className="relative aspect-square w-full rounded-md border border-navy-100 bg-white">
          <div className="absolute left-0 right-0 top-1/2 border-t border-navy-200" />
          <div className="absolute left-1/2 top-0 h-1/2 border-l border-navy-200" />

          <span className="absolute right-3 top-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
            Design
          </span>
          <span className="absolute left-3 top-3 text-xs font-semibold uppercase tracking-wide text-navy-500">
            Technical
          </span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-wide text-navy-500">
            Management
          </span>

          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500 ring-4 ring-gold-100"
            style={{ left: `${dotLeft}%`, top: `${dotTop}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-navy-500">
          <span>Concrete</span>
          <span>Conceptual</span>
        </div>
        <p className="mt-1 text-center text-xs text-navy-500">
          ↑ Content-focus &nbsp;·&nbsp; People-focus ↓
        </p>
      </div>

      <p className="mt-10 text-sm font-medium text-red-600">
        Please forward a screenshot of your result to Gabriella at gmbermea@gmail.com.
      </p>
    </div>
  );
}
