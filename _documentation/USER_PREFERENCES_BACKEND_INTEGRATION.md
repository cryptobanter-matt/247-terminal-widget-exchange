# Backend Integration: User Preferences Persistence

> **Updated:** 2025-12-22
>
> Persist user widget preferences to MongoDB for cross-device/browser sync.

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
{ exchange_id: 1, exchange_user_id: 1 }  // unique compound index
```

### Default Values

When no preferences exist for a user:

```javascript
{
    trade_amount_presets: [100, 250, 500],
    button_style: "swipe",
    long_press_duration: 750
}
```

---

## API Endpoints

### GET /api/app/widget/user-preferences

Fetch user preferences.

**Request:**
```
GET /api/app/widget/user-preferences?exchange_user_id=user_123
Headers:
  X-API-Key: wk_xxx
```

**Response (200 - preferences found):**
```json
{
    "success": true,
    "data": {
        "user_preferences": {
            "trade_amount_presets": [100, 250, 500],
            "button_style": "swipe",
            "long_press_duration": 750
        }
    }
}
```

**Response (200 - no preferences, return defaults):**
```json
{
    "success": true,
    "data": {
        "user_preferences": {
            "trade_amount_presets": [100, 250, 500],
            "button_style": "swipe",
            "long_press_duration": 750
        }
    }
}
```

**Response (401 - invalid API key):**
```json
{
    "success": false,
    "error": "Invalid API key"
}
```

**Response (400 - missing exchange_user_id):**
```json
{
    "success": false,
    "error": "exchange_user_id is required"
}
```

---

### PUT /api/app/widget/user-preferences

Save/update user preferences.

**Request:**
```
PUT /api/app/widget/user-preferences
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
    "success": false,
    "error": "Invalid trade_amount_presets: must have 1, 2, or 4 values"
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

### File Structure (suggested)

```
app/
├── models/
│   └── mongodb/
│       └── widget_user_preferences.js
├── routes/
│   └── widget/
│       ├── widget.routes.js      (add new routes)
│       ├── widget.controller.js  (add handlers)
│       └── widget.service.js     (add business logic)
└── validators/
    └── widget_preferences.js     (validation schemas)
```

### MongoDB Model

**File:** `app/models/mongodb/widget_user_preferences.js`

```javascript
const mongoose = require('mongoose');

const user_preferences_schema = new mongoose.Schema({
    exchange_id: {
        type: String,
        required: true,
        index: true
    },
    exchange_user_id: {
        type: String,
        required: true
    },
    user_preferences: {
        trade_amount_presets: {
            type: [Number],
            default: [100, 250, 500],
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
            default: 'swipe'
        },
        long_press_duration: {
            type: Number,
            enum: [0, 500, 750, 1000],
            default: 750
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

user_preferences_schema.index(
    { exchange_id: 1, exchange_user_id: 1 },
    { unique: true }
);

module.exports = mongoose.model('WidgetUserPreferences', user_preferences_schema);
```

### Service Methods

**File:** `app/routes/widget/widget.service.js`

```javascript
const WidgetUserPreferences = require('../../models/mongodb/widget_user_preferences');

const DEFAULT_PREFERENCES = {
    trade_amount_presets: [100, 250, 500],
    button_style: 'swipe',
    long_press_duration: 750
};

async function get_user_preferences(exchange_id, exchange_user_id) {
    const doc = await WidgetUserPreferences.findOne({
        exchange_id,
        exchange_user_id
    });

    return doc?.user_preferences || DEFAULT_PREFERENCES;
}

async function save_user_preferences(exchange_id, exchange_user_id, user_preferences) {
    // Validate preferences
    validate_preferences(user_preferences);

    const doc = await WidgetUserPreferences.findOneAndUpdate(
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

    return doc.user_preferences;
}

function validate_preferences(prefs) {
    // trade_amount_presets validation
    if (!Array.isArray(prefs.trade_amount_presets)) {
        throw new Error('trade_amount_presets must be an array');
    }
    if (![1, 2, 4].includes(prefs.trade_amount_presets.length)) {
        throw new Error('trade_amount_presets must have 1, 2, or 4 values');
    }
    if (!prefs.trade_amount_presets.every(v => Number.isInteger(v) && v >= 1)) {
        throw new Error('trade_amount_presets values must be integers >= 1');
    }

    // button_style validation
    if (!['swipe', 'standard'].includes(prefs.button_style)) {
        throw new Error('button_style must be "swipe" or "standard"');
    }

    // long_press_duration validation
    if (![0, 500, 750, 1000].includes(prefs.long_press_duration)) {
        throw new Error('long_press_duration must be 0, 500, 750, or 1000');
    }
}

module.exports = {
    get_user_preferences,
    save_user_preferences,
    DEFAULT_PREFERENCES
};
```

### Controller

**File:** `app/routes/widget/widget.controller.js`

```javascript
const widget_service = require('./widget.service');

async function get_user_preferences(req, res) {
    try {
        const { exchange_user_id } = req.query;
        const exchange_id = req.exchange_id; // Set by API key auth middleware

        if (!exchange_user_id) {
            return res.status(400).json({
                success: false,
                error: 'exchange_user_id is required'
            });
        }

        const user_preferences = await widget_service.get_user_preferences(
            exchange_id,
            exchange_user_id
        );

        return res.json({
            success: true,
            data: { user_preferences }
        });
    } catch (error) {
        console.error('[widget_controller] get_user_preferences error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

async function update_user_preferences(req, res) {
    try {
        const { exchange_user_id, user_preferences } = req.body;
        const exchange_id = req.exchange_id; // Set by API key auth middleware

        if (!exchange_user_id) {
            return res.status(400).json({
                success: false,
                error: 'exchange_user_id is required'
            });
        }

        if (!user_preferences) {
            return res.status(400).json({
                success: false,
                error: 'user_preferences is required'
            });
        }

        const saved_preferences = await widget_service.save_user_preferences(
            exchange_id,
            exchange_user_id,
            user_preferences
        );

        return res.json({
            success: true,
            data: { user_preferences: saved_preferences }
        });
    } catch (error) {
        if (error.message.includes('must be') || error.message.includes('must have')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        console.error('[widget_controller] update_user_preferences error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

module.exports = {
    get_user_preferences,
    update_user_preferences
};
```

### Routes

**File:** `app/routes/widget/widget.routes.js`

```javascript
// Add these routes (with existing auth middleware)
router.get('/user-preferences', auth_middleware, widget_controller.get_user_preferences);
router.put('/user-preferences', auth_middleware, widget_controller.update_user_preferences);
```

---

## Frontend Integration (TODO)

Once backend is ready, update the widget frontend:

### 1. Add API Methods

**File:** `src/services/api_service.ts`

```typescript
fetch_user_preferences: async (): Promise<UserPreferences | null> => {
    const { api_key, exchange_user_id } = use_widget_store.getState();

    if (!exchange_user_id) return null;

    try {
        const response = await fetch(
            `${config.api.base_url}/widget/user-preferences?exchange_user_id=${exchange_user_id}`,
            {
                headers: { 'X-API-Key': api_key }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.success ? data.data.user_preferences : null;
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
            `${config.api.base_url}/widget/user-preferences`,
            {
                method: 'PUT',
                headers: {
                    'X-API-Key': api_key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ exchange_user_id, user_preferences })
            }
        );

        return response.ok;
    } catch (error) {
        console.error('[api_service] save_user_preferences error:', error);
        return false;
    }
}
```

### 2. Update Initialization

**File:** `src/services/initialization_service.ts`

```typescript
// After fetching widget config, fetch user preferences
if (options.exchange_user_id) {
    const saved_preferences = await api_service.fetch_user_preferences();
    if (saved_preferences) {
        widget_store.set_user_preferences(saved_preferences);
    }
}
```

### 3. Update Settings Menu Save

**File:** `src/components/SettingsMenu.tsx`

```typescript
const handle_save = async () => {
    set_user_preferences(local_preferences);

    // Sync to backend (fire-and-forget)
    api_service.save_user_preferences(local_preferences);

    on_close();
};
```

---

## Testing Checklist

### Backend Tests
- [ ] GET returns defaults for new user (no document exists)
- [ ] GET returns saved preferences for existing user
- [ ] PUT creates new document for new user
- [ ] PUT updates existing document
- [ ] PUT validates trade_amount_presets length (reject 0, 3, 5+)
- [ ] PUT validates trade_amount_presets values (reject 0, negative, non-integer)
- [ ] PUT validates button_style enum
- [ ] PUT validates long_press_duration enum
- [ ] PUT rejects missing exchange_user_id
- [ ] API key authentication works
- [ ] Invalid API key returns 401

### Integration Tests
- [ ] Widget loads saved preferences on init
- [ ] Widget falls back to defaults if fetch fails
- [ ] Save button triggers PUT request
- [ ] Preferences persist across page reload
- [ ] Preferences persist across devices (same user)

---

## Migration Notes

No migration needed - this is a new collection. MongoDB will create it automatically on first write.

If you need to backfill existing users with defaults, you can skip it - the GET endpoint returns defaults when no document exists.
