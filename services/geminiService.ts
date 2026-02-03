
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { CaseData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are a world-class AI Crime Investigator in a 1940s noir setting. 
Your task is to orchestrate a deep, logical murder mystery game.

CRITICAL RULES:
1. Create a compelling fictional crime scene with 4 distinct suspects.
2. Provide suspects with names, roles, and complex motives.
3. Only reveal ONE initial clue at the very start.
4. Respond in a gritty, noir detective tone (e.g., "The rain was a cold slap in the face...").
5. NEVER reveal the criminal until the user explicitly makes a guess.
6. When the user asks questions, respond logically based on the established facts.
7. If the user "searches the scene" or "asks for a clue", provide ONE subtle, new piece of evidence.
8. IMPORTANT: When you provide a definitive new piece of evidence, prefix it with "CLUE: " so it can be logged in the evidence board.

FORMATTING:
- Initial case setup must be valid JSON.
- Subsequent responses should be Markdown text.`;

export class InvestigationService {
  private chat: Chat;

  constructor() {
    this.chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }

  async startNewCase(): Promise<CaseData> {
    const prompt = `Generate a new murder mystery. 
    Output strictly in JSON format:
    {
      "title": "Case Name",
      "scene": "Atmospheric description of the crime scene",
      "suspects": [
        {"id": "1", "name": "Name", "role": "Role", "description": "Personality/Motive hint", "image": "https://picsum.photos/seed/[random]/400/400"},
        ... 4 total suspects ...
      ],
      "initialClue": "First piece of physical evidence"
    }`;

    const response = await this.chat.sendMessage({ message: prompt });
    try {
      const text = response.text || '';
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse case data", error);
      throw new Error("Invalid case format.");
    }
  }

  async askQuestion(question: string) {
    const response = await this.chat.sendMessage({ message: question });
    return response.text;
  }

  async requestClue() {
    const prompt = `I'm searching the scene further. Uncover one small, subtle, and logical new clue or testimony detail. Prefix it with "CLUE: ".`;
    const response = await this.chat.sendMessage({ message: prompt });
    return response.text;
  }

  async makeGuess(suspectName: string) {
    const prompt = `GUESS: I think the criminal is ${suspectName}. Reveal the truth in a dramatic noir finale, explaining the logic and all clues.`;
    const response = await this.chat.sendMessage({ message: prompt });
    return response.text;
  }
}
