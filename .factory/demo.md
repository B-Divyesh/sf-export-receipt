# Demo

Open `/demo` or add `?demo=1` to load the Harbor Mail sample export. The bundled 869-byte ZIP has two readable data files and one attachment. Its dates run from 2022-02-19 through 2025-01-08. The Profile category is missing so you can see the category check.

The persistent demo banner says **Demo — sample data, nothing is saved**. **Reset demo** reinspects the exact shipped ZIP bytes. **Start for real**, browser Back, and the wordmark drop the sample and return to the real product. Demo data never uses localStorage, sessionStorage, IndexedDB, or a data request. A demo color change stays in memory and leaves any real color preference untouched. Claim test: `npm test -- --grep @claim:demo-isolation`.
