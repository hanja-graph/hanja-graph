export class CardReviewState {
  constructor(
    readonly repetitionNumber: number,
    readonly easinessFactor: number,
    readonly interval: number
  ) {}
}

/*
 * https://en.wikipedia.org/wiki/SuperMemo#cite_note-12
 */
export function processReview(
  grade: number,
  state: CardReviewState
): CardReviewState {
  let repetitionNumber = state.repetitionNumber;
  let easinessFactor = state.easinessFactor;
  let interval = state.interval;
  if (grade >= 3) {
    if (repetitionNumber == 0) {
      interval = 1;
    } else if (repetitionNumber == 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetitionNumber += 1;
  } else {
    repetitionNumber = 0;
    interval = 1;
  }
  easinessFactor =
    easinessFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }
  return new CardReviewState(repetitionNumber, easinessFactor, interval);
}
