# Gold Price Mobile - E2E Testing with Maestro

## Setup

### Install Maestro CLI

**macOS/Linux:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Windows (via WSL):**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

## Running Tests

### Prerequisites
1. Start the Expo development server:
   ```bash
   yarn start
   ```

2. Have a device/emulator running with the app installed:
   ```bash
   # For iOS Simulator
   yarn ios
   
   # For Android Emulator
   yarn android
   ```

### Run Individual Flow
```bash
# Run home screen flow
maestro test e2e/flows/home.yaml

# Run alerts flow
maestro test e2e/flows/alerts.yaml

# Run portfolio flow
maestro test e2e/flows/portfolio.yaml

# Run settings flow
maestro test e2e/flows/settings.yaml
```

### Run All Flows
```bash
maestro test e2e/flows/
```

### Run with Video Recording
```bash
maestro test e2e/flows/home.yaml --record
```

## Flow Descriptions

### Home Flow (`home.yaml`)
- Verifies home screen loads correctly
- Checks that gold prices are displayed
- Tests pull-to-refresh functionality
- Validates price card interaction

### Alerts Flow (`alerts.yaml`)
- Navigates to alerts tab
- Tests alert creation modal
- Fills in alert form
- Verifies alert list display

### Portfolio Flow (`portfolio.yaml`)
- Navigates to portfolio tab
- Tests adding new holding
- Validates portfolio summary display
- Checks profit/loss indicators

### Settings Flow (`settings.yaml`)
- Navigates to settings tab
- Tests dark mode toggle
- Tests language switching
- Verifies settings persistence

## Adding New Tests

Create a new YAML file in `e2e/flows/` following this structure:

```yaml
appId: com.goldprice.app
name: Your Flow Name
---
- waitForAnimationToEnd
- assertVisible: "Element Text"
- tapOn: "Button Text"
```

## CI Integration

For GitHub Actions, add:
```yaml
- name: Run E2E Tests
  run: |
    npm install -g maestro
    maestro test e2e/flows/ --format junit --output e2e-results.xml
```

## Debugging

### View Element Hierarchy
```bash
maestro hierarchy
```

### Interactive Mode
```bash
maestro studio
```

This opens a UI where you can record actions and generate test flows.
