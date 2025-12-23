# Backend Integration: User Preferences Persistence (Corrected)

> **Updated:** 2025-12-23
>
> Persist user widget preferences to MongoDB for cross-device/browser sync.

### Endpoint Status ✅

Both endpoints tested and working. Test API key: `wk_test_abc123def456`

| Endpoint | Status |
|----------|--------|
| `GET /v1/widget/user-preferences` | ✅ Working |
| `PUT /v1/widget/user-preferences` | ✅ Working |

---

## Overview

The widget frontend now has a complete settings UI that stores user preferences locally. This document outlines the backend work needed to sync these preferences to MongoDB.

### Current Frontend State (Complete)

- Settings menu accessible via ⋮ button in news feed header
- User preferences stored in Zustand store with localStorage persistence
- Save button only appears when changes are detected
- Preferences reset on menu close if not saved

### What Backend Needs to Provide

1. GET endpoint to fetch user preferences on widget init
2. PUT endpoint to save user preferences when user clicks Save

---

## Data Structure

### UserPreferences Object

```typescript
interface UserPreferences {
    trade_amount_presets: number[];  // 1, 2, or 4 values (3 not allowed), each >= 1
    button_style: 'swipe' | 'standard';
    long_press_duration: 0 | 500 | 750 | 1000;  // milliseconds
}
```

### MongoDB Document Schema

**Collection:** `widget_user_preferences`

```javascript
{
    _id: ObjectId,
    widget_user_id: String,        // Unique UUID (auto-generated)
    exchange_id: String,           // From API key lookup
    exchange_user_id: String,      // Provided by exchange
    user_preferences: {
        trade_amount_presets: [Number],  // Array of 1, 2, or 4 integers >= 1
        button_style: String,            // "swipe" or "standard"
        long_press_duration: Number      // 0, 500, 750, or 1000
    },
    created_at: Date,
    updated_at: Date
}

// Indexes
{ widget_user_id: 1 }                     // unique index
{ exchange_id: 1, exchange_user_id: 1 }   // unique compound index
```

### Default Values

When no preferences exist for a user:

```javascript
{
    trade_amount_presets: [100, 250, 500],
    button_style: "standard",
    long_press_duration: 500
}
```

---

## API Endpoints

### GET /v1/widget/user-preferences

Fetch user preferences.

**Request:**
```
GET /v1/widget/user-preferences?exchange_user_id=user_123
Headers:
  X-API-Key: wk_xxx
```

**Response (200 - success):**
```json
{
    "success": true,
    "status": "success",
    "message": "preferences retrieved",
    "data": {
        "user_preferences": {
            "trade_amount_presets": [100, 250, 500],
            "button_style": "standard",
            "long_press_duration": 500
        }
    }
}
```

**Response (400 - missing exchange_user_id):**
```json
{
    "status": "error",
    "message": "exchange_user_id is required"
}
```

**Response (401 - invalid API key):**
```json
{
    "status": "error",
    "message": "invalid or inactive exchange"
}
```

---

### PUT /v1/widget/user-preferences

Save/update user preferences.

**Request:**
```
PUT /v1/widget/user-preferences
Headers:
  X-API-Key: wk_xxx
  Content-Type: application/json
Body:
{
    "exchange_user_id": "user_123",
    "user_preferences": {
        "trade_amount_presets": [50, 100, 200, 500],
        "button_style": "standard",
        "long_press_duration": 500
    }
}
```

**Response (200 - success):**
```json
{
    "success": true,
    "status": "success",
    "message": "preferences saved",
    "data": {
        "user_preferences": {
            "trade_amount_presets": [50, 100, 200, 500],
            "button_style": "standard",
            "long_press_duration": 500
        }
    }
}
```

**Response (400 - validation error):**
```json
{
    "status": "error",
    "message": "trade_amount_presets must have 1, 2, or 4 values"
}
```

---

## Validation Rules

### trade_amount_presets
- Must be an array
- Length must be 1, 2, or 4 (NOT 3)
- Each value must be an integer >= 1
- No duplicate values required (user can have [100, 100] if desired)

### button_style
- Must be string
- Must be exactly "swipe" or "standard"

### long_press_duration
- Must be number
- Must be exactly 0, 500, 750, or 1000

### exchange_user_id
- Required for both GET and PUT
- String, non-empty

---

## Backend Implementation

### File Structure

```
app/
├── models/
│   └── mongodb/
│       └── widget_user_preferences.js   (NEW)
├── routes/
│   └── widget/
│       ├── widget.routes.js             (ADD routes)
│       ├── widget.controller.js         (ADD handlers)
│       └── widget.service.js            (ADD methods)
```

---

### MongoDB Model

**File:** `app/models/mongodb/widget_user_preferences.js`

```javascript
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { mongodb_logger as logger } from '#config/logger.js';

const DEFAULT_PREFERENCES = {
    trade_amount_presets: [100, 250, 500],
    button_style: 'standard',
    long_press_duration: 500,
};

const widget_user_preferences_schema = new mongoose.Schema({
    widget_user_id: {
        type: String,
        required: [true, 'widget_user_id is required'],
        unique: true,
        default: uuidv4,
        trim: true
    },
    exchange_id: {
        type: String,
        required: [true, 'exchange_id is required'],
        index: true
    },
    exchange_user_id: {
        type: String,
        required: [true, 'exchange_user_id is required']
    },
    user_preferences: {
        trade_amount_presets: {
            type: [Number],
            default: DEFAULT_PREFERENCES.trade_amount_presets,
            validate: {
                validator: function(arr) {
                    return [1, 2, 4].includes(arr.length) &&
                           arr.every(v => Number.isInteger(v) && v >= 1);
                },
                message: 'trade_amount_presets must have 1, 2, or 4 integer values >= 1'
            }
        },
        button_style: {
            type: String,
            enum: ['swipe', 'standard'],
            default: DEFAULT_PREFERENCES.button_style
        },
        long_press_duration: {
            type: Number,
            enum: [0, 500, 750, 1000],
            default: DEFAULT_PREFERENCES.long_press_duration
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'widget_user_preferences'
});

widget_user_preferences_schema.index({ widget_user_id: 1 }, { unique: true });
widget_user_preferences_schema.index(
    { exchange_id: 1, exchange_user_id: 1 },
    { unique: true }
);

widget_user_preferences_schema.statics.find_by_exchange_user = async function(exchange_id, exchange_user_id) {
    const result = await this.findOne({ exchange_id, exchange_user_id });

    logger.info({
        operation: 'find_preferences',
        data: {
            widget_user_id: result?.widget_user_id || null,
            exchange_id,
            exchange_user_id,
            found: !!result
        }
    }, 'widget_user_preferences');

    return result?.user_preferences || DEFAULT_PREFERENCES;
};

widget_user_preferences_schema.statics.upsert_user_preferences = async function(exchange_id, exchange_user_id, user_preferences) {
    const result = await this.findOneAndUpdate(
        { exchange_id, exchange_user_id },
        {
            exchange_id,
            exchange_user_id,
            user_preferences
        },
        {
            upsert: true,
            new: true,
            runValidators: true
        }
    );

    logger.info({
        operation: 'upsert_preferences',
        data: {
            widget_user_id: result.widget_user_id,
            exchange_id,
            exchange_user_id,
            was_created: result.created_at.getTime() === result.updated_at.getTime()
        }
    }, 'widget_user_preferences');

    return result.user_preferences;
};

export const WidgetUserPreferences = mongoose.model('WidgetUserPreferences', widget_user_preferences_schema);
export { DEFAULT_PREFERENCES };
```

---

### Service Methods

**File:** `app/routes/widget/widget.service.js`

Add these methods to the existing `widget_service` export:

```javascript
import jwt from 'jsonwebtoken';
import { widget_model } from '#models/postgres/widget.js';
import { WidgetUserPreferences, DEFAULT_PREFERENCES } from '#models/mongodb/widget_user_preferences.js';
import { redis_client } from '#config/redis.js';
import { logger } from '#config/logger.js';

const TOKEN_EXPIRY_SECONDS = 30;
const CONFIG_CACHE_TTL = 300;

export const widget_service = {
    // ... existing methods (create_signed_token, get_config, get_config_by_api_key) ...

    async get_user_preferences(exchange_id, exchange_user_id) {
        return await WidgetUserPreferences.find_by_exchange_user(exchange_id, exchange_user_id);
    },

    async save_user_preferences(exchange_id, exchange_user_id, user_preferences) {
        validate_preferences(user_preferences);
        return await WidgetUserPreferences.upsert_user_preferences(exchange_id, exchange_user_id, user_preferences);
    },

    async get_exchange_id_from_api_key(api_key) {
        const exchange_config = await widget_model.get_exchange_by_api_key(api_key);
        if (!exchange_config || !exchange_config.is_active) {
            return null;
        }
        return exchange_config.exchange_id;
    }
};

function validate_preferences(prefs) {
    if (!prefs || typeof prefs !== 'object') {
        const error = new Error('user_preferences must be an object');
        error.code = 'VALIDATION_ERROR';
        throw error;
    }

    if (!Array.isArray(prefs.trade_amount_presets)) {
        const error = new Error('trade_amount_presets must be an array');
        error.code = 'VALIDATION_ERROR';
        throw error;
    }

    if (![1, 2, 4].includes(prefs.trade_amount_presets.length)) {
        const error = new Error('trade_amount_presets must have 1, 2, or 4 values');
        error.code = 'VALIDATION_ERROR';
        throw error;
    }

    if (!prefs.trade_amount_presets.every(v => Number.isInteger(v) && v >= 1)) {
        const error = new Error('trade_amount_presets values must be integers >= 1');
        error.code = 'VALIDATION_ERROR';
        throw error;
    }

    if (!['swipe', 'standard'].includes(prefs.button_style)) {
        const error = new Error('button_style must be "swipe" or "standard"');
        error.code = 'VALIDATION_ERROR';
        throw error;
    }

    if (![0, 500, 750, 1000].includes(prefs.long_press_duration)) {
        const error = new Error('long_press_duration must be 0, 500, 750, or 1000');
        error.code = 'VALIDATION_ERROR';
        throw error;
    }
}
```

---

### Controller

**File:** `app/routes/widget/widget.controller.js`

Add these handlers to the existing `widget_controller` export:

```javascript
import { widget_service } from './widget.service.js';
import { success_response, error_response } from '#utils/response.js';
import { logger } from '#config/logger.js';

export const widget_controller = {
    // ... existing methods (generate_trade_token, get_config) ...

    async get_user_preferences(req, res, next) {
        try {
            const { exchange_user_id } = req.query;
            const api_key = req.headers['x-api-key'];

            if (!api_key) {
                return error_response(res, 'x-api-key header is required', 401);
            }

            if (!exchange_user_id) {
                return error_response(res, 'exchange_user_id is required', 400);
            }

            const exchange_id = await widget_service.get_exchange_id_from_api_key(api_key);
            if (!exchange_id) {
                return error_response(res, 'invalid or inactive exchange', 401);
            }

            const user_preferences = await widget_service.get_user_preferences(
                exchange_id,
                exchange_user_id
            );

            return success_response(res, { user_preferences }, 'preferences retrieved');
        } catch (error) {
            logger.error({
                operation: 'get_user_preferences',
                error: error.message
            }, 'widget_controller: error');
            next(error);
        }
    },

    async update_user_preferences(req, res, next) {
        try {
            const { exchange_user_id, user_preferences } = req.body;
            const api_key = req.headers['x-api-key'];

            if (!api_key) {
                return error_response(res, 'x-api-key header is required', 401);
            }

            if (!exchange_user_id) {
                return error_response(res, 'exchange_user_id is required', 400);
            }

            if (!user_preferences) {
                return error_response(res, 'user_preferences is required', 400);
            }

            const exchange_id = await widget_service.get_exchange_id_from_api_key(api_key);
            if (!exchange_id) {
                return error_response(res, 'invalid or inactive exchange', 401);
            }

            const saved_preferences = await widget_service.save_user_preferences(
                exchange_id,
                exchange_user_id,
                user_preferences
            );

            logger.info({
                exchange_id,
                exchange_user_id
            }, 'widget: user preferences saved');

            return success_response(res, { user_preferences: saved_preferences }, 'preferences saved');
        } catch (error) {
            if (error.code === 'VALIDATION_ERROR') {
                return error_response(res, error.message, 400);
            }

            logger.error({
                operation: 'update_user_preferences',
                error: error.message,
                code: error.code
            }, 'widget_controller: error');
            next(error);
        }
    }
};
```

---

### Routes

**File:** `app/routes/widget/widget.routes.js`

```javascript
import express from 'express';
import { widget_controller } from './widget.controller.js';

const router = express.Router();

router.post('/generate-trade-token', widget_controller.generate_trade_token);
router.get('/config', widget_controller.get_config);

router.get('/user-preferences', widget_controller.get_user_preferences);
router.put('/user-preferences', widget_controller.update_user_preferences);

export default router;
```

---

## Frontend Integration ✅ Complete

All frontend integration has been implemented.

> **Note:** The `config.api.base_url` is `http://localhost:3000/v1/widget` (already includes `/v1/widget`), so endpoint paths should be relative (e.g., `/user-preferences`, not `/widget/user-preferences`).

### 1. Response Type ✅

**File:** `src/types/widget.ts`

```typescript
export interface UserPreferenceResponse {
    success: boolean;
    status: string;
    message: string;
    data: {
        user_preferences: UserPreferences;
    };
}
```

### 2. API Methods ✅

**File:** `src/services/api_service.ts`

```typescript
import type { UserPreferences, UserPreferenceResponse } from "../types/widget.ts";

// Add to api_service object:

fetch_user_preferences: async (): Promise<UserPreferences | null> => {
    const { api_key, exchange_user_id } = use_widget_store.getState();

    if (!exchange_user_id) return null;

    try {
        const response = await fetch(
            `${config.api.base_url}/user-preferences?exchange_user_id=${encodeURIComponent(exchange_user_id)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(api_key && { 'X-API-Key': api_key }),
                }
            }
        );

        if (!response.ok) throw new Error(`Preferences fetch failed: ${response.status}`);

        const result: UserPreferenceResponse = await response.json();
        if (!result.success) throw new Error('Preferences response unsuccessful');

        return result.data.user_preferences;
    } catch (error) {
        console.error('[api_service] fetch_user_preferences error:', error);
        return null;
    }
},

save_user_preferences: async (user_preferences: UserPreferences): Promise<boolean> => {
    const { api_key, exchange_user_id } = use_widget_store.getState();

    if (!exchange_user_id) return false;

    try {
        const response = await fetch(
            `${config.api.base_url}/user-preferences`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(api_key && { 'X-API-Key': api_key }),
                },
                body: JSON.stringify({ exchange_user_id, user_preferences })
            }
        );

        if (!response.ok) throw new Error(`Preferences save failed: ${response.status}`);

        const result: UserPreferenceResponse = await response.json();
        return result.success;
    } catch (error) {
        console.error('[api_service] save_user_preferences error:', error);
        return false;
    }
}
```

### 3. Initialization ✅

**File:** `src/services/initialization_service.ts`

```typescript
// After line 49 (after setting feature_flags), add:
if (options.exchange_user_id) {
    const saved_preferences = await api_service.fetch_user_preferences();
    if (saved_preferences) {
        use_widget_store.getState().set_user_preferences(saved_preferences);
    }
}
```

### 4. Settings Menu Save ✅

**File:** `src/components/SettingsMenu.tsx`

The fire-and-forget pattern provides poor UX when backend sync fails. Add loading state and error feedback:

```typescript
// Add state at top of component:
const [is_saving, set_is_saving] = useState(false);

// Replace handle_save:
const handle_save = async () => {
    set_is_saving(true);

    // Update local store immediately (optimistic update)
    set_user_preferences(local_preferences);

    // Sync to backend
    const success = await api_service.save_user_preferences(local_preferences);

    set_is_saving(false);

    if (!success) {
        console.warn('[SettingsMenu] Backend sync failed, preferences saved locally only');
    }

    on_close();
};

// Update SaveButton to show loading state:
{has_changes && (
    <SaveButton onClick={handle_save} disabled={is_saving}>
        {is_saving ? 'Saving...' : 'Save'}
    </SaveButton>
)}
```

Update the `SaveButton` styled component to handle disabled state:

```typescript
const SaveButton = styled.button<{ disabled?: boolean }>`
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm};
    margin-top: ${({ theme }) => theme.spacing.md};
    border: none;
    border-radius: ${({ theme }) => theme.radii.sm};
    background: ${({ theme, disabled }) => disabled ? theme.colors.text_muted : theme.colors.success};
    color: white;
    font-size: ${({ theme }) => theme.font_sizes.sm};
    font-weight: 600;
    cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
    transition: opacity 0.15s ease;

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:active:not(:disabled) {
        opacity: 0.8;
    }
`;
```

---

## Testing Checklist

### Backend Tests (2025-12-23) ✅ All Passing

**GET /v1/widget/user-preferences:**
- [x] GET returns defaults for new user (no document exists)
- [x] GET returns saved preferences for existing user
- [x] GET rejects missing exchange_user_id (400)
- [x] GET rejects missing API key (401)
- [x] GET rejects invalid API key (401)

**PUT /v1/widget/user-preferences:**
- [x] PUT saves preferences and returns saved data
- [x] PUT updates existing document
- [x] PUT validates trade_amount_presets length (rejects 3 values)
- [x] PUT validates trade_amount_presets values (rejects 0)
- [x] PUT validates button_style enum (rejects "invalid")
- [x] PUT validates long_press_duration enum (rejects 999)
- [x] PUT rejects missing exchange_user_id (400)
- [x] PUT rejects missing user_preferences (400)
- [x] PUT rejects invalid API key (401)

### Integration Tests (Ready for Testing)
- [ ] Widget loads saved preferences on init
- [ ] Widget falls back to defaults if fetch fails
- [ ] Save button triggers PUT request
- [ ] Save button shows "Saving..." during request
- [ ] Preferences persist across page reload
- [ ] Preferences persist across devices (same user)

---

## Migration Notes

No migration needed - this is a new collection. MongoDB will create it automatically on first write.

If you need to backfill existing users with defaults, you can skip it - the GET endpoint returns defaults when no document exists.

---

## Changes from Original Document

| Issue | Original | Corrected |
|-------|----------|-----------|
| Module syntax | CommonJS (`require`/`module.exports`) | ES Modules (`import`/`export`) |
| Route path | `/api/app/widget/...` | `/v1/widget/...` |
| Response format | Custom `{ success, error }` | Uses `success_response`/`error_response` helpers |
| Logging | `console.error` | Pino `logger` |
| Import paths | Relative paths | Path aliases (`#models/...`, `#utils/...`) |
| Model pattern | Basic exports | Static methods with logging |
| Service pattern | Separate module | Add to existing `widget_service` |
