# PlantGuardian IoT Mobile

Expo React Native app for PlantGuardian IoT.

## Current Screens

- Splash
- Mock login
- Dashboard
- Sensor details
- Control
- History
- Settings

## Backend Connection

Expo Go derives the default backend URL from the Metro host, using port `8000`.
For example, a device that opens `exp://192.168.1.25:8081` will call
`http://192.168.1.25:8000`.

You can still override the API URL from the Settings tab when needed.

## Run

```bash
pnpm install
pnpm start
```

Web preview:

```bash
pnpm web
```

TypeScript check:

```bash
pnpm typecheck
```

## Implemented Modules

- API client for dashboard, history, and command endpoints.
- WebSocket client for `/ws/realtime`.
- Zustand settings store.
- Light and dark themes.
- Reusable cards, badges, metric rings, charts, and control buttons.

## Next Step

Persist settings locally and add component tests for formatting, cards, and command states.
