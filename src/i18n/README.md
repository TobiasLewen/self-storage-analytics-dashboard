# Internationalization (i18n) Guide

This directory contains the internationalization configuration and translation files for the self-storage analytics dashboard.

## Structure

```
src/i18n/
├── config.ts           # i18n initialization and configuration
├── locales/
│   ├── de.json        # German translations
│   └── en.json        # English translations
└── README.md          # This file
```

## Supported Languages

- **German (de)** - Default language
- **English (en)** - Secondary language

## Usage

### In React Components

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('pages.dashboard.title')}</h1>
      <p>{t('pages.dashboard.description')}</p>
    </div>
  )
}
```

### With Interpolation

```typescript
// Translation file
{
  "welcome": "Welcome, {{name}}!"
}

// Component
const { t } = useTranslation()
return <p>{t('welcome', { name: 'John' })}</p>
// Output: "Welcome, John!"
```

### With Pluralization

```typescript
// Translation file
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}

// Component
const { t } = useTranslation()
return <p>{t('items', { count: 5 })}</p>
// Output: "5 items"
```

### With Fallback

```typescript
const { t } = useTranslation()
// If key doesn't exist, use fallback
return <p>{t('missing.key', 'Default text')}</p>
```

## Translation Key Structure

Translation keys follow a hierarchical structure:

```
common.*                    - Common UI elements
  ├── buttons.*            - Button labels
  ├── labels.*             - Form labels
  ├── actions.*            - Action verbs
  └── status.*             - Status messages

pages.*                     - Page-specific translations
  ├── dashboard.*          - Dashboard page
  ├── units.*              - Unit performance page
  ├── customers.*          - Customer analytics page
  ├── forecast.*           - Forecast page
  └── settings.*           - Settings page

components.*                - Component-specific translations
  ├── notificationCenter.* - Notification center
  ├── dateRangePicker.*    - Date range picker
  ├── generalSettings.*    - General settings
  └── ...

toast.*                     - Toast notification messages
errors.*                    - Error messages
validation.*                - Form validation messages
```

## Adding New Translations

### 1. Add to German (de.json)

```json
{
  "pages": {
    "myNewPage": {
      "title": "Meine neue Seite",
      "description": "Beschreibung der Seite"
    }
  }
}
```

### 2. Add to English (en.json)

```json
{
  "pages": {
    "myNewPage": {
      "title": "My New Page",
      "description": "Page description"
    }
  }
}
```

### 3. Use in Component

```typescript
const { t } = useTranslation()
return (
  <div>
    <h1>{t('pages.myNewPage.title')}</h1>
    <p>{t('pages.myNewPage.description')}</p>
  </div>
)
```

## Language Switching

Language can be changed through the Settings page or programmatically:

```typescript
import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }
  
  return (
    <div>
      <button onClick={() => changeLanguage('de')}>Deutsch</button>
      <button onClick={() => changeLanguage('en')}>English</button>
    </div>
  )
}
```

The language preference is automatically saved to localStorage and persists across sessions.

## Date and Number Formatting

For locale-aware date and number formatting, use the utilities from `@/lib/formatUtils`:

```typescript
import { formatDate, formatCurrency, formatPercent } from '@/lib/formatUtils'
import { useSettings } from '@/contexts/SettingsContext'

function MyComponent() {
  const { settings } = useSettings()
  
  const date = new Date()
  const amount = 1234.56
  const percentage = 0.85
  
  return (
    <div>
      <p>Date: {formatDate(date, settings)}</p>
      <p>Amount: {formatCurrency(amount, settings)}</p>
      <p>Percentage: {formatPercent(percentage, settings)}</p>
    </div>
  )
}
```

## Best Practices

### 1. Use Descriptive Keys

❌ Bad:
```json
{
  "text1": "Save",
  "text2": "Cancel"
}
```

✅ Good:
```json
{
  "common": {
    "buttons": {
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

### 2. Group Related Translations

❌ Bad:
```json
{
  "dashboardTitle": "Dashboard",
  "dashboardDescription": "Overview",
  "settingsTitle": "Settings"
}
```

✅ Good:
```json
{
  "pages": {
    "dashboard": {
      "title": "Dashboard",
      "description": "Overview"
    },
    "settings": {
      "title": "Settings"
    }
  }
}
```

### 3. Avoid Hardcoded Text

❌ Bad:
```typescript
return <button>Save</button>
```

✅ Good:
```typescript
const { t } = useTranslation()
return <button>{t('common.buttons.save')}</button>
```

### 4. Use Interpolation for Dynamic Content

❌ Bad:
```typescript
return <p>Welcome, {userName}!</p>
```

✅ Good:
```typescript
const { t } = useTranslation()
return <p>{t('common.welcome', { name: userName })}</p>
```

## Testing Translations

### Check for Missing Keys

```typescript
// In development, missing keys will show as the key itself
// e.g., "pages.missing.key" instead of translated text
```

### Test Language Switching

1. Go to Settings → General
2. Change language from German to English
3. Verify all UI text updates correctly
4. Refresh page and verify language persists

### Test Date/Number Formatting

1. Go to Settings → General
2. Change date format
3. Verify dates update throughout the app
4. Change currency format
5. Verify currency displays update

## Troubleshooting

### Translation Not Showing

1. Check if the key exists in both de.json and en.json
2. Verify the key path is correct (case-sensitive)
3. Check browser console for i18n errors
4. Ensure the component is wrapped in I18nextProvider

### Language Not Changing

1. Check if SettingsContext is properly integrated
2. Verify localStorage is accessible
3. Check browser console for errors
4. Try clearing localStorage and refreshing

### Date Format Not Applying

1. Verify you're using `formatDate` from `@/lib/formatUtils`
2. Check that settings are being passed correctly
3. Ensure dateFormat setting is valid

## Adding a New Language

To add support for a new language (e.g., French):

1. Create `src/i18n/locales/fr.json` with all translation keys
2. Update `src/i18n/config.ts` to include the new language:
   ```typescript
   resources: {
     de: { translation: de },
     en: { translation: en },
     fr: { translation: fr }, // Add this
   }
   ```
3. Update `src/contexts/SettingsContext.tsx` to include 'fr' in Language type
4. Add French option to language selector in GeneralSettings
5. Add French locale support in `formatUtils.ts`

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Intl.DateTimeFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Intl.NumberFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
