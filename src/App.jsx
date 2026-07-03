import { useEffect, useState } from 'react';
import IntakeForm from './components/IntakeForm.jsx';
import TraitAxisQuestionCard from './components/TraitAxisQuestionCard.jsx';
import TraitAxisResults from './components/TraitAxisResults.jsx';
import { getTraitAxisItems } from './lib/getTraitAxisItems.js';
import { scoreTraitAxis } from './lib/traitAxisScoring.js';

// intake -> questions -> results
export default function App() {
  const [items, setItems] = useState(null);
  const [itemsError, setItemsError] = useState(null);

  const [screen, setScreen] = useState('intake');
  const [respondent, setRespondent] = useState(null); // { name, email }

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scored, setScored] = useState(null);

  useEffect(() => {
    getTraitAxisItems()
      .then(setItems)
      .catch((err) => setItemsError(err.message));
  }, []);

  function handleBegin({ name, email }) {
    setRespondent({ name, email });
    setScreen('questions');
  }

  function handleAnswer(value) {
    const item = items[currentIndex];
    const nextAnswers = { ...answers, [item.pair_id]: value };
    setAnswers(nextAnswers);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    const finalScored = scoreTraitAxis(nextAnswers, items);
    setScored(finalScored);
    setScreen('results');
    submitResponse(nextAnswers);
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  async function submitResponse(finalAnswers) {
    try {
      await fetch('/api/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: respondent.name,
          email: respondent.email,
          traitAxisAnswers: finalAnswers,
        }),
      });
    } catch {
      // Best-effort: the on-screen result already stands on its own even if
      // this save fails (e.g. offline). Nothing for the respondent to act on.
    }
  }

  if (itemsError) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-navy-800">{itemsError}</p>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-navy-500">Loading assessment…</p>
      </div>
    );
  }

  if (screen === 'intake') {
    return <IntakeForm onBegin={handleBegin} />;
  }

  if (screen === 'questions') {
    const item = items[currentIndex];
    return (
      <TraitAxisQuestionCard
        item={item}
        index={currentIndex}
        total={items.length}
        selectedValue={answers[item.pair_id] ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }

  if (screen === 'results') {
    return <TraitAxisResults scored={scored} />;
  }

  return null;
}
