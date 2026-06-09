export type SortablePetForDeck = {
  isAvailable: boolean;
  captureDate: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
};

export function sortPetsForDeck<TPet extends SortablePetForDeck>(pets: TPet[]): TPet[] {
  return [...pets].sort((left, right) => {
    return (
      compareAvailability(left, right) ||
      compareNullableDateAsc(left.captureDate, right.captureDate) ||
      compareNullableDateDesc(left.publishedAt, right.publishedAt) ||
      compareDateDesc(left.createdAt, right.createdAt)
    );
  });
}

function compareAvailability(left: SortablePetForDeck, right: SortablePetForDeck): number {
  if (left.isAvailable === right.isAvailable) {
    return 0;
  }

  return left.isAvailable ? -1 : 1;
}

function compareNullableDateAsc(left: Date | null, right: Date | null): number {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return left.getTime() - right.getTime();
}

function compareNullableDateDesc(left: Date | null, right: Date | null): number {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return right.getTime() - left.getTime();
}

function compareDateDesc(left: Date, right: Date): number {
  return right.getTime() - left.getTime();
}
