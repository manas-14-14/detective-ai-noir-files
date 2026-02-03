
export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface Clue {
  id: string;
  text: string;
  timestamp: string;
}

export interface GameState {
  caseTitle: string;
  sceneDescription: string;
  suspects: Suspect[];
  clues: Clue[];
  isGameOver: boolean;
  actualCriminal: string | null;
  messages: Message[];
  status: 'loading' | 'investigating' | 'guessing' | 'revealing';
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CaseData {
  title: string;
  scene: string;
  suspects: Suspect[];
  initialClue: string;
}
