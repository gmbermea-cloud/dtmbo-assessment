import { useEffect, useState } from 'react';
import IntakeForm from './components/IntakeForm.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import TraitAxisTransition from './components/TraitAxisTransition.jsx';
import TraitAxisQuestionCard from './components/TraitAxisQuestionCard.jsx';
import TraitAxisResults from './components/TraitAxisResults.jsx';
import FirmDashboard from './components/FirmDashboard.jsx';
import { getItems } from './lib/getItems.js';
import { getTraitAxisItems } from './lib/getTraitAxisItems.js';
import { scoreResponses } from './lib/scoring.js';
import { scoreTraitAxis } from './lib/traitAxisScoring.js';

// intake -> questions -> results -> traitAxisTransition -> traitAxisQuestions -> traitAxisResults
export default function App() {
  const [items, setItems] = useState(null);
  const [traitAxisItems, setTraitAxisItems] = useState(null);
  const [itemsError, setItemsError] = useState(null);

  const [screen, setScreen] = useState('intake');
  const [respondent, setRespondent] = useState(null); // { name, email }

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scored, setScored] = useState(null);

  const [traitAxisAnswers, setTraitAxisAnswers] = useState({});
  const [traitAxisIndex, setTraitAxisIndex] = useState(0);
  const [traitAxisScored, setTraitAxisScored] = useState(null);

  const isFirmPage = window.location.pathname === '/firm';

  useEffect(() => {
    if (isFirmPage) return;
    Promise.all([getItems(), getTraitAxisItems()])
      .then(([loadedItems, loadedTraitAxisItems]) => {
        setItems(loadedItems);
        setTraitAxisItems(loadedTraitAxisItems);
      })
      .catch((err) => setItemsError(err.message));
  }, [isFirmPage]);

  function handleBegin({ name, email }) {
    setRespondent({ name, email });
    setScreen('questions');
  }

  function handleAnswer(value) {
    const item = items[currentIndex];
    const nextAnswers = { ...answers, [item.item_id]: value };
    setAnswers(nextAnswers);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    setScored(scoreResponses(nextAnswers, items));
    setScreen('results');
  }

  function handleBack() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handleContinueToPart2() {
    setScreen('traitAxisTransition');
  }

  function handleTraitAxisBegin() {
    setScreen('traitAxisQuestions');
  }

  function handleTraitAxisAnswer(value) {
    const item = traitAxisItems[traitAxisIndex];
    const nextAnswers = { ...traitAxisAnswers, [item.pair_id]: value };
    setTraitAxisAnswers(nextAnswers);

    if (traitAxisIndex < traitAxisItems.length - 1) {
      setTraitAxisIndex(traitAxisIndex + 1);
      return;
    }

    const finalTraitAxisScored = scoreTraitAxis(nextAnswers, traitAxisItems);
    setTraitAxisScored(finalTraitAxisScored);
    setScreen('traitAxisResults');
    submitResponse(answers, nextAnswers);
  }

  function handleTraitAxisBack() {
    if (traitAxisIndex === 0) {
      setScreen('traitAxisTransition');
      return;
    }
    setTraitAxisIndex((i) => Math.max(0, i - 1));
  }

  async function submitResponse(finalAnswers, finalTraitAxisAnswers) {
    try {
      await fetch('/api/submit-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: respondent.name,
          email: respondent.email,
          answers: finalAnswers,
          traitAxisAnswers: finalTraitAxisAnswers,
        }),
      });
    } catch {
      // Best-effort: the on-screen result already stands on its own even if
      // this save fails (e.g. offline). Nothing for the respondent to act on.
    }
  }

  if (isFirmPage) {
    return <FirmDashboard />;
  }

  if (itemsError) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-navy-800">{itemsError}</p>
      </div>
    );
  }

  if (!items || !traitAxisItems) {
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
      <QuestionCard
        item={item}
        index={currentIndex}
        total={items.length}
        selectedValue={answers[item.item_id] ?? null}
        onAnswer={handleAnswer}
        onBack={handleBack}
      />
    );
  }

  if (screen === 'results') {
    return <ResultsScreen scored={scored} onContinue={handleContinueToPart2} />;
  }

  if (screen === 'traitAxisTransition') {
    return <TraitAxisTransition onContinue={handleTraitAxisBegin} />;
  }

  if (screen === 'traitAxisQuestions') {
    const item = traitAxisItems[traitAxisIndex];
    return (
      <TraitAxisQuestionCard
        item={item}
        index={traitAxisIndex}
        total={traitAxisItems.length}
        selectedValue={traitAxisAnswers[item.pair_id] ?? null}
        onAnswer={handleTraitAxisAnswer}
        onBack={handleTraitAxisBack}
      />
    );
  }

  if (screen === 'traitAxisResults') {
    return <TraitAxisResults scored={traitAxisScored} />;
  }

  return null;
}
