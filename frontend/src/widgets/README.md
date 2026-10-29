# ENOTES widgets

These widgets provide ENOTES-friendly equivalents of the SNOTES `src/widgets`
components. Import them from `src/widgets` or `src/widgets/commonpopup`.

All widgets use explicit props and local mock data. Form controls are described
with typed `EnFormField` values rather than SNOTES server-provided metadata.
Selection popups accept rows and columns from their caller and use an accessible
table; no SNOTES grid, API, global store, or route is called.

The employee, password, address, and spreadsheet widgets are UI-only:

- Password dialogs call an optional application callback and do not verify,
  encrypt, or save passwords.
- The address popup is manual entry; it does not load a third-party postcode
  script.
- Spreadsheet selection only passes a browser `File` to `onFileSelected`; it
  does not parse, upload, validate, or save workbook contents itself.
- `EnPopupSettings` contains a small illustrative set of local popup schemas,
  not a copy of SNOTES production popup configuration.

The existing `src/components/search-panel` remains the standard feature-screen
SearchPanel. `EnSearchPanel` is the schema-driven widget equivalent for screens
that need a generated form panel.
