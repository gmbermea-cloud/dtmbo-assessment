import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IntakeForm({ onBegin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const nameError = touched && name.trim().length === 0 ? 'Name is required.' : null;
  const emailError = touched && !EMAIL_RE.test(email.trim()) ? 'Enter a valid email address.' : null;
  const isValid = name.trim().length > 0 && EMAIL_RE.test(email.trim());

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onBegin({ name: name.trim(), email: email.trim() });
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold text-navy-800">DTPBO Career Inclination Assessment</h1>
      <p className="mt-4 text-navy-700 leading-relaxed">
        16 quick either/or choices about how you naturally approach problems — no right or
        wrong answers, and not a measure of skill or experience, just where your instincts
        lean. It takes about 2 minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy-800">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-navy-100 px-3 py-2 text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            placeholder="Your full name"
          />
          {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-navy-100 px-3 py-2 text-navy-900 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            placeholder="you@example.com"
          />
          {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-navy-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-800"
        >
          Begin
        </button>
      </form>
    </div>
  );
}
