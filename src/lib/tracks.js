import { TRACK_ORDER } from './scoring.js';

export { TRACK_ORDER };

// Descriptions summarize the pattern of each track's item bank. Swap in the
// official item-bank doc language if/when Gabriella provides it.
export const TRACKS = {
  D: {
    name: 'Design',
    color: '#B5563C',
    description:
      "You're energized by the exploratory, conceptual side of practice — generating ideas, iterating on a concept, and shaping how a space feels before anything is locked down.",
  },
  T: {
    name: 'Technical',
    color: '#4C6B57',
    description:
      "You're energized by resolving how things actually get built — technical detail, documentation accuracy, and consultant coordination are where you do your best work.",
  },
  P: {
    name: 'Project Management',
    color: '#1B2A4A',
    description:
      "You're energized by keeping people, schedules, and budgets aligned — organizing the moving pieces and being the point of contact who keeps a project moving forward.",
  },
  B: {
    name: 'Business Development',
    color: '#C9973D',
    description:
      "You're energized by relationships and opportunity — meeting new people, pursuing new work, and thinking about the firm's reputation and growth.",
  },
  O: {
    name: 'Operations/Finance',
    color: '#6B4E71',
    description:
      "You're energized by the systems that keep a firm running — financial health, internal process, staffing, and risk sitting behind the scenes of any single project.",
  },
};
