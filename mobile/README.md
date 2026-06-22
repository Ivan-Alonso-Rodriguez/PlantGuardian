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

The default API URL is:

```text
http://127.0.0.1:8000
```

Change it from the Settings tab when testing on a real device. A physical phone usually needs the computer LAN IP instead of `127.0.0.1`.

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
