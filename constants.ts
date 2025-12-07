import { SegmentId } from './types';

// Map characters to their 7-segment representation (true = stick present)
// 0: Top, 1: TopLeft, 2: TopRight, 3: Middle, 4: BottomLeft, 5: BottomRight, 6: Bottom
export const CHAR_TO_SEGMENTS: Record<string, boolean[]> = {
  '0': [true, true, true, false, true, true, true],
  '1': [false, false, true, false, false, true, false],
  '2': [true, false, true, true, true, false, true],
  '3': [true, false, true, true, false, true, true],
  '4': [false, true, true, true, false, true, false],
  '5': [true, true, false, true, false, true, true],
  '6': [true, true, false, true, true, true, true],
  '7': [true, false, true, false, false, true, false], // Or with TopLeft? Standard is usually just top and right
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true], // Or bottom included? usually yes
  '+': [false, false, false, true, false, false, false, true], // Special handling for + (needs vertical and horizontal) -> Actually standard 7-seg can't do '+' perfectly centered without hacks.
  '-': [false, false, false, true, false, false, false],
  '=': [false, false, false, true, false, false, true], // = is tricky on 7-seg. usually we use specific SVGs for ops.
};

// For this app, we will use a unified grid but operators might need special "segment" logic or just hardcoded standard segments if we force them into the grid.
// Let's standardise: 
// 0: Top
// 1: Top-Left
// 2: Top-Right
// 3: Middle
// 4: Bottom-Left
// 5: Bottom-Right
// 6: Bottom

// REVISED MAPPING for cleaner logic
export const SEGMENT_MAP: Record<string, number[]> = {
  '0': [0, 1, 2, 4, 5, 6],
  '1': [2, 5],
  '2': [0, 2, 3, 4, 6],
  '3': [0, 2, 3, 5, 6],
  '4': [1, 2, 3, 5],
  '5': [0, 1, 3, 5, 6],
  '6': [0, 1, 3, 4, 5, 6],
  '7': [0, 2, 5],
  '8': [0, 1, 2, 3, 4, 5, 6],
  '9': [0, 1, 2, 3, 5, 6], // 9 with bottom usually
  '-': [3], // Middle only
};

// Operators like + and = are structurally different from 7-seg digits.
// We will handle them as special "Digit" types or just use the same 7-seg grid but interpret them loosely.
// Actually, '+' needs a vertical crossing the middle. 7-seg doesn't have a middle vertical.
// To keep it simple and consistent:
// We will use a modified grid that supports a middle-vertical stick for '+' symbols, 
// OR we just compose '+' from two crossed matches. 
// A common matchstick puzzle convention is that '+' is made of 2 matches. '=' is 2 matches.
// Let's assume a "Digit" component handles 0-9.
// An "Operator" component handles +, -, =.
// But to allow "moving a match from + to make a 4", they need to be compatible.
// However, usually, you turn a + into a - (1 move). You don't turn a + into a 7.
// So we will keep operators separate but clickable.

// Definition of Operator types
export const OPERATOR_SEGMENTS: Record<string, string[]> = {
  '+': ['h_mid', 'v_mid'],
  '-': ['h_mid'],
  '=': ['h_top', 'h_btm'] // Requires slightly different spacing
};
