# Widget Implementation Status - Consolidated Plan

> **Last Updated:** 2025-12-22
>
> This document consolidates all widget-related implementation into a single source of truth.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Implementation Status](#implementation-status)
4. [Outstanding Tasks](#outstanding-tasks)
5. [Backend API Reference](#backend-api-reference)
6. [Testing Checklist](#testing-checklist)

---

## Executive Summary

The 247 Terminal Widget is a secure, embeddable trading widget designed for exchange partners. The widget enables exchanges to integrate our news-driven trading capabilities into their platforms while ensuring we can reliably track and bill for every trade.

### Core Security Mechanism

The widget uses a **One-Time Trade Token** system:
1. Widget requests a signed JWT from our backend before any trade
2. Exchange backend must validate this JWT to execute the trade
3. This makes our backend a mandatory, non-bypassable step in the trade flow

### Key Components

| Component | Status | Location |
|-----------|--------|----------|
| Database Schema | ✅ Complete | Backend: `migrations/006_*.sql`, `migrations/007_*.sql` |
| Widget Model (Postgres) | ✅ Complete | Backend: `app/models/postgres/widget.js` |
| Widget Connection (Redis) | ✅ Complete | Backend: `app/models/redis/widget_connection.js` |
| REST API (Trade Token) | ✅ Complete | Backend: `app/routes/widget/` |
| REST API (Config) | ✅ Complete | Backend: `app/routes/widget/` |
| WebSocket Service | ✅ Complete | Backend: `app/websocket/widget/` |
| News Broadcasting | ✅ Complete | Backend: `app/websocket/news/news.broadcaster.js` |
| Trade Stats (Public) | ✅ Complete | Backend: `app/models/redis/trade_stats.js` |
| **Frontend Widget** | 🟡 In Progress | This repository |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Exchange Website                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     247 Terminal Widget                              │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │   │
│  │  │ News Feed   │    │ Trade       │    │ WebSocket Client        │  │   │
│  │  │ Component   │    │ Buttons     │    │ (receives news)         │  │   │
│  │  └─────────────┘    └──────┬──────┘    └───────────┬─────────────┘  │   │
│  └────────────────────────────┼───────────────────────┼────────────────┘   │
└───────────────────────────────┼───────────────────────┼────────────────────┘
                                │                       │
                                │ HTTPS Request         │ WebSocket
                                │ (get trade token)     │ Connection
                                ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         247 Terminal Backend                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────┐  │
│  │ POST /widget/       │    │ WS /ws/widget       │    │ GET /widget/    │  │
│  │ generate-trade-token│    │ (news streaming)    │    │ config          │  │
│  └──────────┬──────────┘    └──────────┬──────────┘    └────────┬────────┘  │
│             │                          │                        │           │
│             ▼                          ▼                        ▼           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     PostgreSQL + Redis                               │   │
│  │  • exchange_configurations    • Rate limit counters                  │   │
│  │  • widget_trades              • Connection tracking                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                │ Signed JWT
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Exchange Backend                                     │
│  • Verifies JWT signature using shared secret_signing_key                   │
│  • Executes trade on behalf of user                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Two-Key Security Model

| Key | Purpose | Visibility | Used By |
|-----|---------|------------|---------|
| **`api_key`** | Identifies exchange for WebSocket auth | Public (embedded in widget) | Widget → Our Backend |
| **`secret_signing_key`** | Cryptographically signs trade JWTs | Private (never exposed) | Our Backend → Exchange Backend |

---

## Implementation Status

### Frontend Widget - Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Preact | 10.27.2 | Lightweight React alternative |
| TypeScript | 5.9.3 | Type safety with strict mode |
| Zustand | 5.0.9 | State management with persist middleware |
| styled-components | 6.1.19 | CSS-in-JS theming |
| Framer Motion | 12.23.26 | Animations |
| Vite | 6.1.1 | Build tooling with UMD output |

### Frontend Widget - File Structure

```
src/
├── components/
│   ├── Button.tsx                 # Base button component
│   ├── ConnectionStatus.tsx       # WebSocket connection indicator
│   ├── ErrorState.tsx             # Error display component
│   ├── LoadingState.tsx           # Loading spinner
│   ├── MotionButton.tsx           # Animated button wrapper
│   ├── SandboxBanner.tsx          # Sandbox mode indicator
│   ├── StandardTradeButtons.tsx   # Long/Short button pair
│   ├── SwipeTradeButtonV2.tsx     # Swipe-to-trade component
│   └── TradeAmountSelector.tsx    # Amount selection buttons
├── features/
│   └── news_feed/
│       ├── amount_button.tsx      # Trade amount button
│       ├── embedded_tweet.tsx     # Tweet embed renderer
│       ├── news_card.tsx          # Main news card component
│       ├── news_card_body.tsx     # Card body with content
│       ├── news_card_header.tsx   # Card header with source
│       ├── news_card_trading.tsx  # Trading section
│       ├── news_detail.tsx        # Expanded news view
│       ├── news_feed.tsx          # Main feed container
│       └── trading_row.tsx        # Coin selection row
├── services/
│   ├── api_service.ts             # HTTP requests to backend
│   ├── initialization_service.ts  # Widget initialization
│   ├── trade_service.ts           # Trade execution logic
│   └── websocket_service.ts       # WebSocket connection
├── store/
│   └── news_store.ts              # Zustand store
├── styles/
│   ├── styled.d.ts                # Theme type definitions
│   └── theme.ts                   # Theme configuration
├── types/
│   └── news.ts                    # TypeScript interfaces
├── app.tsx                        # Root component
├── config/_index.ts               # Configuration
├── main.tsx                       # Entry point
├── mock_data.ts                   # Development mock data
└── widget.tsx                     # Public API (TerminalWidget.init())
```

### Frontend Widget - Component Status

| Component | Status | Notes |
|-----------|--------|-------|
| WebSocket Service | ✅ Complete | Exponential backoff reconnection (1s → 16s, max 5 attempts) |
| API Service | ✅ Complete | Trade token generation, config fetching |
| Trade Service | ✅ Complete | Trade execution with token flow |
| News Store | ✅ Complete | Zustand with connection state, news items, trading config |
| News Feed | ✅ Complete | Virtualized list, responsive layout |
| News Card | ✅ Complete | Header, body, trading section |
| News Card Header | ✅ Complete | Source icon, author, time, coin badges |
| News Card Body | ✅ Complete | Title, content, embedded tweets |
| Trading Section | ✅ Complete | Coin selector, amount buttons, trade buttons |
| Swipe Trade Button | ✅ Complete | Gesture-based trading with haptic feedback |
| Standard Trade Buttons | ✅ Complete | Long/Short button pair |
| Shadow DOM Isolation | ✅ Complete | CSS isolation for production |
| UMD Build | ✅ Complete | Standalone widget deployment |
| Mock Data | ✅ Complete | 20 items with various info object combinations |

### Frontend Widget - Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Real-time news streaming | ✅ Complete | Via WebSocket |
| Trade button interactions | ✅ Complete | Long/Short with visual feedback |
| Coin selection | ✅ Complete | BTC, ETH, SOL from config |
| Amount presets | ✅ Complete | From trading config |
| Connection status | ✅ Complete | Visual indicator |
| Error states | ✅ Complete | Error display component |
| Loading states | ✅ Complete | Loading spinner |
| Sandbox mode banner | ✅ Complete | Dev environment indicator |
| Dynamic theming | ✅ Complete | From config API |
| Trade execution | 🟡 Partial | Logs trade but doesn't call execute_trade() |
| Info metadata display | ❌ Not Started | Retweet/quote/reply/article indicators |
| Volume alerts | ❌ Not Started | Received via WS but no UI |
| Sentiment indicators | 🟡 Partial | Data available, display incomplete |

---

## Outstanding Tasks

### Frontend Widget - Critical

#### 1. Wire Up Trade Execution
**Location:** `src/features/news_feed/news_card.tsx:73`

Currently trades are logged but not executed:
```typescript
// Current (incomplete)
const handle_trade = (side: 'long' | 'short') => {
    console.log('Trade:', { side, coin: selected_coin, amount: selected_amount, news_id: item._id });
    // TODO: Call execute_trade from trade_service
};
```

**Fix:** Import and call `execute_trade()` from trade service, handle response/errors.

#### 2. Render Info Object Metadata
**Location:** `src/features/news_feed/news_card_header.tsx`

The `NewsItem.info` object contains metadata that should be displayed:
- `isRetweet` - Show retweet indicator
- `isQuote` - Show quote indicator
- `isReply` / `isSelfReply` - Show reply indicator
- `isArticle` - Show article indicator
- `isTranslated` - Show translation indicator with `originalLanguage`
- `authorVerificationType` - Show verification badge

#### 3. Display Volume Alerts
**Location:** New component needed

Volume alerts are received via WebSocket but have no UI. Need to add visual notification when volume alerts arrive.

### Frontend Widget - Minor

#### 4. Complete Sentiment Display
Add visual sentiment indicators (bullish/bearish/neutral) to news cards.

#### 5. Improve Error Handling UX
Currently errors only log to console. Add user-facing error messages and retry options.

#### 6. Clean Up Legacy Code
Remove unused `SwipeTradeButton.tsx` (replaced by `SwipeTradeButtonV2.tsx`).

### Backend - Optional Enhancements (Future)

#### 1. Origin Validation
- [ ] Implement origin validation in WebSocket auth
- Location: `app/websocket/widget/widget.service.js` in `validate_api_key_auth()`

#### 2. Widget Dashboard Stats Endpoint
- [ ] Add `GET /dashboard/stats/widget` for widget metrics

---

## Backend API Reference

### REST Endpoints

#### Generate Trade Token

```http
POST /api/app/widget/generate-trade-token
Content-Type: application/json

{
    "exchange_id": "blofin",
    "exchange_user_id": "user-uuid-here",
    "trade_params": {
        "coin": "BTC",
        "amount": 100,
        "side": "long",
        "news_id": "optional-news-id"
    }
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "trade_id": "uuid",
        "expires_in": 30
    },
    "message": "token generated successfully"
}
```

#### Get Widget Config

```http
GET /api/app/widget/config?id=blofin
```

**Response:**
```json
{
    "success": true,
    "data": {
        "exchange_id": "blofin",
        "display_name": "Blofin Exchange",
        "theme_config": {
            "primaryColor": "#3A86FF",
            "backgroundColor": "#121212"
        },
        "feature_flags": {
            "showPnl": true,
            "allowMarketOrders": true
        }
    }
}
```

### WebSocket Protocol

#### Connection URL
```
wss://api.247terminal.com/ws/widget
```

#### Authentication (Client → Server)
```json
{ "type": "auth", "api_key": "wk_live_xxxx" }
```

#### Auth Success (Server → Client)
```json
{ "type": "auth_success", "exchange_id": "blofin" }
```

#### News Broadcast (Server → Client)
```json
{
    "type": "news",
    "data": {
        "_id": "abc123",
        "title": "Bitcoin Surges Past $100K",
        "time": 1702400000000,
        "coins": ["BTC"],
        "info": {
            "isRetweet": false,
            "isQuote": false,
            "isReply": false,
            "isSelfReply": false,
            "isArticle": false,
            "isTranslated": false,
            "authorVerificationType": "none"
        }
    }
}
```

#### WebSocket Close Codes

| Code | Name | Description |
|------|------|-------------|
| 4001 | AUTH_TIMEOUT | Client didn't authenticate within 10 seconds |
| 4002 | AUTH_FAILED | Invalid or missing API key |
| 4003 | EXCHANGE_INACTIVE | Exchange is disabled |
| 4004 | RATE_LIMIT_CONNECTIONS | Too many connections for this exchange |
| 4006 | RATE_LIMIT_MESSAGES | Too many messages per minute |
| 4008 | ORIGIN_NOT_ALLOWED | Connection from unauthorized origin |

---

## Testing Checklist

### Frontend Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check
```

### WebSocket Connection Test

```javascript
const ws = new WebSocket('ws://localhost:3000/ws/widget');

ws.onopen = () => {
    console.log('Connected');
    ws.send(JSON.stringify({ type: 'auth', api_key: 'wk_test_abc123def456' }));
};

ws.onmessage = (e) => {
    console.log('Received:', JSON.parse(e.data));
};
```

### REST API Tests

```bash
# Test config endpoint
curl "http://localhost:3000/api/app/widget/config?id=test_exchange"

# Test trade token generation
curl -X POST "http://localhost:3000/api/app/widget/generate-trade-token" \
  -H "Content-Type: application/json" \
  -d '{
    "exchange_id": "test_exchange",
    "exchange_user_id": "user123",
    "trade_params": {
        "coin": "BTC",
        "amount": 100,
        "side": "long"
    }
  }'
```
