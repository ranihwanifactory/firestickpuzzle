export type SegmentId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// 0: Top, 1: TopLeft, 2: TopRight, 3: Middle, 4: BottomLeft, 5: BottomRight, 6: Bottom
// Standard 7-segment layout

export interface PuzzleData {
  originalEquation: string; // e.g., "6+4=4"
  targetMoves: number;      // e.g., 1
  hint: string;
}

export interface DigitState {
  charIndex: number;
  activeSegments: boolean[]; // Array of 7 booleans
  originalChar: string;
}

export enum GameState {
  LOADING,
  PLAYING,
  WON,
  LOST,
  ERROR
}
