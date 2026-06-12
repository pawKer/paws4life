# Romanian Copy Refresh

## Goal

Refresh the Romanian interface copy so Paws for Life feels affectionate, natural, and hopeful while remaining clear about the responsibility and official steps involved in adoption.

## Voice

- Prefer warm, conversational Romanian over literal product-language translations.
- Use `cățeluș` and `cățeluși` across discovery, gallery, saved-list, and empty-state copy.
- Keep the sweetness restrained: no dense strings of diminutives, baby talk, or jokes that trivialize adoption.
- Address the user directly where this makes an action or outcome feel friendlier.
- Prefer short labels that remain easy to scan on cards and mobile controls.

## Terminology

- Rename the deck navigation label from `Deck` to `Descoperă`.
- Rename `Lista scurtă` to `Cățeluși preferați` and adjust related saved-list messages naturally.
- Keep `Cunoaște` as the gallery profile action.
- Replace dating-app language such as `E potrivire!` with an affectionate response such as `Ți-a cucerit inima!`.
- Prefer humane browsing labels such as `Sosiți recent` where the source meaning permits it.

## Official Information

Copy attached to shelter records must remain factual and unembellished. This includes registry number, capture date and location, approximate age, sex, size, color, characteristics, availability, synchronization state, contact details, opening hours, and adoption procedures.

The refresh may improve grammar or clarity in these labels, but it must not soften, reinterpret, or obscure the underlying information. `Data capturării` remains unchanged because it names the shelter's recorded event accurately.

## Scope

Update user-facing strings in `src/content/ro.ts` and any directly related Romanian fallback copy that is currently hardcoded outside that file. Preserve the user's existing `Mijlocie` to `Medie` change. Do not alter application behavior, data fields, URLs, shelter details, or profile-generation logic beyond wording.

## Validation

- Review every changed string in the component where it appears, including mobile labels and accessibility text.
- Update assertions that intentionally depend on changed copy.
- Run the focused pet-deck tests, then the full test suite if the focused checks pass.
- Check TypeScript/build output only if the copy changes require code edits beyond string values.
