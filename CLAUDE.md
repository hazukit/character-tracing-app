# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a character tracing app for children built with React, TypeScript, and HTML5 Canvas. The app displays characters (animals, shapes) and allows kids to trace over the text with their fingers or stylus on touch devices.

**Note**: This project was designed to be copyright-safe by using generic characters and emoji instead of proprietary intellectual property.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core Components

- **App.tsx**: Main application component that manages character state, custom text input, and coordinates between components
- **DrawingCanvas.tsx**: Canvas component handling pointer events for drawing/tracing functionality
- **characterApi.ts**: Service for managing character data with configurable data sources

### Key Features

1. **Character Display**: Shows random characters (animals, shapes) with names in Japanese
2. **Text Tracing**: Displays text as background with transparent canvas overlay for tracing
3. **Custom Text Input**: Allows users to input custom text for tracing practice
4. **Touch/Pointer Support**: Uses pointer events for iPad pen and finger compatibility
5. **Responsive Design**: Mobile-friendly layout with proper touch handling

### Technical Implementation

- **Canvas Drawing**: Uses HTML5 Canvas with pointer events for cross-device compatibility
- **Text Overlay**: CSS positioning to layer transparent canvas over background text
- **Character System**: Abstracted data source system supporting multiple character sets
- **Touch Events**: `touchAction: 'none'` prevents scrolling while drawing

### Data Sources

The app uses a flexible data source system in `characterApi.ts`:

- **Animals**: Copyright-free animal characters using emoji
- **Shapes**: Basic geometric shapes
- **Extensible**: Easy to add new character sets

### Testing

- Jest with Testing Library for component testing
- Canvas API mocking for drawing functionality tests
- Character API service mocking

### Styling

- Simple CSS without external frameworks
- Responsive design with mobile-first approach
- Z-index layering for text/canvas overlay effect

## Copyright Considerations

This project has been designed to avoid copyright issues:

- Uses standard Unicode emoji characters
- No proprietary character designs or trademarked names
- Abstracted system allows easy switching of character sources
- MIT License for all custom code