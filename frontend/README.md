# ENOTES frontend prototype

Browser based ENOTES workspace prototype built with React, TypeScript, and Vite. The UI uses local mock data only. It does not connect to an API or database, and local demo saves are not persisted after a tab or page is closed.

## Run locally

```sh
npm install
npm run dev
```

## Available screens

- Dashboard overview
- Purchase and sales registration, with editable detail rows
- Purchase and sales history and a sales summary
- Products, stock movements, stock balance, customers, suppliers, and accounts
- Menu Register with local filtering and editable illustrative fields

The dark action bar dispatches supported actions to the active tab. Menu search, folder expansion, tab switching, per tab screen state, and unsaved draft confirmation are handled in the browser. Data is illustrative and all save messages identify local demo behavior.

## Quality checks

```sh
npm run lint
npm run build
```

Backend integration, authentication, persistence, and finalized business rules are outside the current frontend scope.
# ENOTESNEXT
