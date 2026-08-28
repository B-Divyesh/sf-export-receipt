# Demo

Open `/demo` or add `?demo=1` to load the Harbor Mail sample archive. It has two readable data files, one attachment, valid dates from 2022-02-19 through 2025-01-08, and an intentionally missing Profile category so the category check is visible.

The persistent demo banner says **Demo — sample data, nothing is saved**. **Reset demo** reconstructs the sample from shipped bytes. **Start for real** drops the in-memory sample and opens the real local file picker. Demo data never uses localStorage, sessionStorage, IndexedDB, or a data request. Claim test: `npm test -- --grep @claim:demo-isolation`.
