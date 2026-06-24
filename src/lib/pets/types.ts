export type PetSex = "female" | "male" | "unknown";
export type PetSize = "small" | "medium" | "large" | "unknown";

export type PetCard = {
  id: string;
  sourceUrl: string;
  registryNumber: string;
  title: string | null;
  imageUrl: string | null;
  captureDate: string | null;
  captureDateText: string | null;
  firstSeenAt: string;
  captureLocation: string | null;
  approximateAge: string | null;
  sex: PetSex;
  size: PetSize;
  color: string | null;
  characteristics: string | null;
  profileName: string | null;
  profileBio: string | null;
  shareImagesGeneratedAt: string | null;
  isAvailable: boolean;
};

export type LatestSync = {
  startedAt: string;
  finishedAt: string | null;
  status: string;
  foundCount: number;
  unavailableCount: number;
} | null;
