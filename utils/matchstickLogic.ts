import { SEGMENT_MAP } from '../constants';

// Reverse map to check what number a set of segments forms
export const getCharFromSegments = (activeSegments: boolean[]): string | null => {
  // Convert boolean array to indices
  const activeIndices = activeSegments
    .map((isActive, index) => (isActive ? index : -1))
    .filter((i) => i !== -1);

  for (const [char, indices] of Object.entries(SEGMENT_MAP)) {
    if (indices.length !== activeIndices.length) continue;
    
    // Check if all indices match
    const isMatch = indices.every(idx => activeSegments[idx]);
    if (isMatch) return char;
  }
  return null;
};

// Check if a string is a valid math equation
export const evaluateEquation = (equationStr: string): boolean => {
  try {
    if (!equationStr.includes('=')) return false;
    const parts = equationStr.split('=');
    if (parts.length !== 2) return false;
    
    // Basic sanitization
    const left = parts[0];
    const right = parts[1];

    // Evaluate
    // eslint-disable-next-line no-new-func
    const leftVal = Function(`"use strict"; return (${left})`)();
    // eslint-disable-next-line no-new-func
    const rightVal = Function(`"use strict"; return (${right})`)();

    return leftVal === rightVal;
  } catch (e) {
    return false;
  }
};
