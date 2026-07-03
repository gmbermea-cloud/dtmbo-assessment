import { useEffect, useState } from 'react';
import IntakeForm from './components/IntakeForm.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import { getItems } from './lib/getItems.js';
import { scoreResponses } from './lib/scoring.js';

export default function App() {
  const [items, setItems] = useState(null);
  const [itemsError, setItemsError] = useState(null);

  const [screen, setScreen] = useState('intake'); // intake | questions | results
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scored, setScored] = useState(null);

  useEffect(() => {
    getItems()
      .then(setItems)
      .catch((err) => setItemsError(err.message));
  }, []);

  function handleBegin() {
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
    return <ResultsScreen scored={scored} />;
  }

  return null;
}
