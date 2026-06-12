type ProfileNameSource = {
  id: string;
  registryNumber?: string | null;
  profileName?: string | null;
};

const generatedPetNames = [
  "Luna",
  "Milo",
  "Nala",
  "Toby",
  "Maya",
  "Bruno",
  "Kira",
  "Max",
  "Bella",
  "Rex",
  "Dora",
  "Oscar",
];

export function getPetProfileName(pet: ProfileNameSource): string {
  if (pet.profileName) {
    return pet.profileName;
  }

  const seed = numericSeed(pet.registryNumber || pet.id);
  return generatedPetNames[seed % generatedPetNames.length];
}

function numericSeed(value: string) {
  return [...value].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}
