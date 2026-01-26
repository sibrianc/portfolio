# Bilingual Translation System - Complete Guide

## Overview
Your portfolio now has a **complete bilingual system** supporting English and Spanish. The system automatically translates:
- All static content (navigation, buttons, labels)
- All project content (titles, summaries, descriptions)
- Future projects added through the admin panel

## How It Works

### 1. Language Switching
Click the language toggle button (EN/ES) in the navigation bar to switch between languages. The selection is stored in the session and persists across page navigation.

### 2. Static Content Translation
All static text uses the `t()` function:
```html
<a href="#">{{ t('projects') }}</a>  
<!-- Shows "Projects" in English, "Proyectos" in Spanish -->
```

### 3. Project Content Translation
Projects have duplicate fields for each language:
- `title` (English) / `title_es` (Spanish)
- `summary` (English) / `summary_es` (Spanish)  
- `description` (English) / `description_es` (Spanish)

The system automatically shows the correct version using `get_loc_attr()`:
```html
<h1>{{ get_loc_attr(project, 'title') }}</h1>
<!-- Shows English title or Spanish title based on current language -->
```

## Adding New Projects (Admin Panel)

When you create a new project at `/admin/projects/new`, you'll see bilingual fields:

### English Fields
- **Title (English)** - Required
- **Summary (English)** - Optional short description
- **Description (English)** - Optional full description with HTML support

### Spanish Fields  
- **Título (Español)** - Optional (fallback to English if empty)
- **Resumen (Español)** - Optional (fallback to English if empty)
- **Descripción (Español)** - Optional (fallback to English if empty)

### Language-Agnostic Fields
- **Slug** - URL-friendly identifier (no translation needed)
- **Tech Stack** - Comma-separated list (same in both languages)
- **Repo URL** - GitHub/GitLab link
- **Live URL** - Deployed project link
- **Cover Image URL** - Project thumbnail
- **Video URL** - Optional demo video
- **Featured** - Checkbox to show on homepage

## Adding New Translations

To add translations for new UI elements:

1. Open `portfolio/translations.py`
2. Add the new key to both languages:

```python
TRANSLATIONS = {
    'en': {
        # ...existing translations...
        'new_button': 'Click Here',
    },
    'es': {
        # ...existing translations...
        'new_button': 'Haz Clic Aquí',
    }
}
```

3. Use in templates:
```html
<button>{{ t('new_button') }}</button>
```

## Database Schema

### Projects Table
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    
    -- English fields
    title VARCHAR(120) NOT NULL,
    summary VARCHAR(280),
    description TEXT,
    
    -- Spanish fields  
    title_es VARCHAR(120),
    summary_es VARCHAR(280),
    description_es TEXT,
    
    -- Language-agnostic
    slug VARCHAR(140) UNIQUE NOT NULL,
    tech_stack VARCHAR(240),
    repo_url VARCHAR(240),
    live_url VARCHAR(240),
    cover_image VARCHAR(240),
    video_url VARCHAR(240),
    is_featured BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME
);
```

## Available Translation Keys

See `portfolio/translations.py` for the full list. Key categories:

### Navigation
- `home`, `about`, `projects`, `contact`

### Projects
- `featured_projects`, `project_details`, `tech_stack`, `access`
- `live_demo`, `source_code`, `initialize`, `explore`

### Contact Form  
- `form_name`, `form_email`, `form_message`, `form_send`
- `contact_title`, `contact_subtitle`, `contact_description`

### Admin
- `admin_login`, `admin_dashboard`, `view_messages`, `new_project`
- `edit`, `delete`, `save`, `logout`

### Messages
- `success`, `error`, `message_sent`, `message_error`

## Fallback Behavior

If a Spanish translation is missing:
1. **Static content**: Shows the key name (e.g., "undefined_key")
2. **Project content**: Falls back to the English version automatically

This ensures the site never shows blank content.

## Testing the Translation System

1. **Start the server**: `python run.py`
2. **Visit homepage**: `http://localhost:5000`
3. **Click language toggle** (top-right): EN ↔ ES
4. **Verify translations**:
   - Navigation menu changes
   - Project titles/descriptions change
   - Contact form labels change
   - All static text changes

## Notes for Future Development

- **Always add both languages** when adding new UI text
- **Spanish fields are optional** in projects but recommended for better UX
- **Tech stack doesn't need translation** (technical terms are universal)
- **URLs don't change** with language (SEO consideration)
- **Session-based**: Language preference resets when browser closes (can be upgraded to cookies for persistence)

## Example Workflow: Adding a New Project

1. Go to `/admin/login` and log in
2. Click "New Project"
3. Fill in:
   - Title (English): "Weather Dashboard"
   - Título (Español): "Panel del Clima"
   - Summary (English): "Real-time weather tracking app"
   - Resumen (Español): "App de seguimiento del clima en tiempo real"
   - Description (English): "<p>Built with React and OpenWeather API...</p>"
   - Descripción (Español): "<p>Construido con React y OpenWeather API...</p>"
   - Slug: "weather-dashboard"
   - Tech Stack: "React, OpenWeather API, TailwindCSS"
   - (other fields as needed)
4. Click "Save"
5. Test by switching languages on the projects page

✅ **The project now displays in both languages automatically!**
