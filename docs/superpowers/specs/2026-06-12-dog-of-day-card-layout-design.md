# Dog of the Day Card Layout

## Goal

Bring the Dog of the Day spotlight closer to the gallery card visual language while preserving its larger, featured presentation.

## Design

- Keep the current full-width image-left spotlight layout.
- Show the registry number beneath the dog's name, matching the gallery cards.
- Render the first three generated profile pills beneath the bio using the shared bio-toned `Pill` component.
- Retain the waiting progress bar and capture-date information as spotlight-specific details.
- Keep the shared adoption-dialog trigger and save button in one wrapping action row.
- Vertically center the action controls and give the save button the same overall height as the adoption trigger.
- Preserve the save button's profile-page behavior: secondary when unsaved and primary with a filled heart when saved.

## Testing

Update the Dog of the Day component test to verify the registry number and pills render, while retaining coverage for the adoption dialog and save states. Run the focused test followed by the full test suite after implementation.
