# SideQuest - Codebase Summary

## Project Overview

**SideQuest** is a React Native mobile application built with Expo that delivers personalized daily "side quests" - small, fun, achievable challenges that help users add novelty, productivity, and joy to their day. The app uses AI to generate personalized quests based on user preferences and feedback, creating a gamified approach to daily activities.

### Key Technologies
- **Frontend**: React Native with Expo SDK 53
- **Backend**: Flask (Python) with Supabase (PostgreSQL)
- **Build System**: EAS Build for development, preview, and production builds
- **API Client**: Apisauce with automatic camelCase/snake_case conversion
- **Authentication**: Anonymous device-based authentication
- **Notifications**: Expo Notifications for daily reminders
- **Storage**: Expo SecureStore for sensitive data, AsyncStorage for app state
- **Navigation**: Expo Router with file-based routing and web support
- **State Management**: React Context with useReducer hooks
- **TypeScript**: Strict mode with path aliases (@/* imports)

---

## Application Architecture

### Authentication System (`/auth/`)

**`AuthContext.tsx`** - Central authentication provider that manages user state and app initialization
- Handles anonymous authentication using device ID
- Manages onboarding completion status
- Provides `initializeApp()`, `signInWithProfile()`, and `signOut()` methods
- Uses secure storage for tokens and user data
- Integrates with notification service initialization

**`storage.tsx`** - Secure storage utilities for authentication data
- Token management (JWT storage/retrieval)
- User data persistence
- Onboarding completion tracking
- Uses Expo SecureStore for sensitive data

### API Layer (`/api/`)

**`client.ts`** - Centralized API client configuration
- Built on apisauce with automatic error handling
- Transforms request/response data between camelCase (frontend) and snake_case (backend)
- Adds JWT authentication headers automatically
- Standardized error handling with structured error format
- Base URL configuration through environment

**`config.ts`** - API configuration and endpoints
- Environment-based API URL configuration
- Centralized endpoint definitions

**`+html.tsx`** - Web-specific HTML root template (Expo Router)
- Configures root HTML structure for web builds
- Sets viewport, charset, and responsive background styles
- Includes ScrollView style resets for web compatibility
- Dark mode support via CSS media queries

**Services** (`/api/services/`):
- **`authService.ts`** - Authentication API calls (anonymous sign-in)
- **`questService.ts`** - Quest management (get board, refresh, update status, history)
- **`profileService.ts`** - User profile management
- **`votingService.ts`** - Quest template voting system with QuestTemplate and QuestTemplateVote interfaces
- **`notificationService.ts`** - Push notification management and scheduling

### State Management (`/context/`)

**`QuestContext.tsx`** - Quest state management with useReducer
- Manages quest board state, loading states, and errors
- Provides `loadQuestBoard()`, `refreshQuestBoard()`, `updateQuestStatus()` methods
- Handles quest status updates (accepted, completed, abandoned, declined)
- Uses reducer pattern for complex state updates

**`OnboardingContext.tsx`** - Onboarding flow state management
- Multi-step onboarding process (Welcome → Preferences → Completion)
- Profile data collection and validation
- Step navigation with progress tracking
- Default category selections

### Navigation & Routing (`/app/`)

**`_layout.tsx`** - Root layout with provider hierarchy
- Wraps app in SafeAreaProvider, GestureHandlerRootView
- Provider stack: AuthProvider → QuestProvider → OnboardingProvider
- Configures Expo Router with authentication guards
- Sets up notification listeners

**`index.tsx`** - App loading screen and authentication gate
- Handles app initialization and authentication checking
- Routes users to onboarding or main app based on auth status
- Manages splash screen visibility

**`(auth)/`** - Authentication screens
- **`_layout.tsx`** - Auth stack layout
- **`onboarding.tsx`** - Onboarding flow entry point

**`(tabs)/`** - Main app tab navigation
- **`_layout.tsx`** - Tab bar configuration with authentication guards
- **`index.tsx`** - Main quest board screen (Today tab)
- **`vote.tsx`** - Quest template voting screen
- **`history.tsx`** - Quest history and statistics
- **`profile.tsx`** - User profile and settings

### Components (`/components/`)

**Common Components** (`/components/common/`):
- **`Button.tsx`** - Reusable button component with multiple variants
- **`Card.tsx`** - Styled card container component
- **`Input.tsx`** - Form input component
- **`Error.tsx`** - Error display component with retry functionality
- **`AnimatedLoading.tsx`** - Loading spinner component
- **`RefreshSpinner.tsx`** - Pull-to-refresh spinner

**Quest Components** (`/components/quests/`):
- **`QuestCard.tsx`** - Main quest display component with category badges, difficulty indicators, and action buttons
- **`QuestCompletionModal.tsx`** - Modal for quest completion feedback

**Onboarding Components** (`/components/onboarding/`):
- **`OnboardingWelcome.tsx`** - Welcome screen
- **`OnboardingPreferences.tsx`** - Category and preference selection
- **`OnboardingNotifications.tsx`** - Notification permission setup
- **`OnboardingCompletion.tsx`** - Final onboarding step
- **`OnboardingFlow.tsx`** - Flow coordinator
- **`index.ts`** - Export barrel for onboarding components

**Profile Components** (`/components/profile/`):
- **`ProfileEditor.tsx`** - Main profile editing interface
- **`CategorySelector.tsx`** - Quest category selection
- **`DifficultySelector.tsx`** - Difficulty preference selection
- **`TimeSelector.tsx`** - Time preference selection
- **`NotificationSettings.tsx`** - Notification configuration
- **`AdditionalNotesInput.tsx`** - Free-text preferences input
- **`index.ts`** - Export barrel for profile components with TypeScript type exports

### Utilities (`/utils/`)

**`deviceId.ts`** - Device identification for anonymous authentication
- Generates and stores unique device UUIDs
- Uses Expo SecureStore for persistence
- Development mode support with hardcoded ID
- Fallback handling for storage failures

**`timezone.ts`** - Timezone handling utilities
- Device timezone detection
- Timezone validation and formatting

**`fallbackQuests.ts`** - Hardcoded fallback quests
- Emergency quest data when API fails
- Covers all categories and difficulty levels

### Type Definitions (`/types/types.ts`)

Core data structures:
- **`Quest`** - Individual quest with status, feedback, timing
- **`QuestBoard`** - Daily quest board containing 3 quests
- **`QuestStatus`** - Enum for quest states (potential, accepted, completed, etc.)
- **`QuestCategory`** - 8 categories (fitness, social, mindfulness, etc.)
- **`QuestDifficulty`** - Easy, medium, hard
- **`QuestFeedback`** - User feedback structure
- **`UserProfile`** - Complete user preference profile
- **`OnboardingProfile`** - Profile data during onboarding

### Constants (`/constants/`)

**`Colors.ts`** - App color palette
- Primary colors (warm brown theme)
- Category-specific colors for visual coding
- Status colors for UI states
- Dark/light mode support

**`Layout.ts`** - Layout constants and responsive utilities
- Screen dimensions and breakpoints
- Spacing and sizing constants

**`Theme.ts`** - Theme configuration
- Typography styles
- Component styling constants

### Custom Hooks (`/hooks/`)

**`useAutoSave.ts`** - Auto-save functionality for forms
- Debounced saving to prevent excessive API calls
- Loading state management
- Error handling for save operations

**Platform-specific hooks**:
- **`useColorScheme.ts`** / **`useColorScheme.web.ts`** - Theme detection
- **`useClientOnlyValue.ts`** / **`useClientOnlyValue.web.ts`** - SSR compatibility

---

## Core Features

### 1. Quest Board Management
- **Daily Refresh**: Quest boards refresh at midnight in user's timezone
- **Quest Generation**: AI-generated quests based on user preferences
- **Quest Actions**: Accept, decline, complete, abandon quests
- **Status Tracking**: Comprehensive quest status system
- **Feedback Loop**: User feedback influences future quest generation

### 2. User Onboarding
- **Category Selection**: Choose from 8 quest categories
- **Preference Setting**: Difficulty, time preferences, additional notes
- **Notification Setup**: Permission request and scheduling
- **Profile Creation**: Anonymous account creation with device ID

### 3. Quest Template Voting
- **Swipe Interface**: Tinder-like voting on quest templates
- **Quality Control**: Community-driven quest quality improvement
- **Data Collection**: Votes inform quest generation algorithms
- **Infinite Scroll**: Continuous loading of new templates

### 4. History & Statistics
- **7-Day History**: Recent quest completion tracking
- **Statistics**: Streak, success rate, category preferences
- **Progress Tracking**: Visual representation of quest completion

### 5. Profile Management
- **Preference Updates**: Modify categories, difficulty, timing
- **Notification Settings**: Configure reminder times and permissions
- **Additional Notes**: Free-text preference specification

### 6. Notification System
- **Daily Reminders**: Scheduled notifications for quest board checks
- **Permission Management**: Proper iOS/Android permission handling
- **Channel Configuration**: Android notification channels

---

## Data Flow

### Authentication Flow
1. App initialization triggers `initializeApp()`
2. Device ID generation/retrieval from secure storage
3. Anonymous sign-in with backend using device ID
4. JWT token storage and user state update
5. Onboarding status check and routing decision

### Quest Management Flow
1. Quest board loading checks for stale data (24h cycle)
2. API call triggers backend quest generation if needed
3. Quest status updates sent to backend with feedback
4. Local state updates reflect backend changes
5. History and statistics calculated from quest data

### Onboarding Flow
1. Welcome screen introduction
2. Category and preference selection
3. Notification permission request
4. Profile data compilation and backend submission
5. Onboarding completion flag storage

### Voting Flow
1. Fetch quest templates from backend (excluding already voted)
2. Present templates in swipe interface
3. Submit votes to backend
4. Remove voted templates from local state
5. Load more templates as needed

---

## Key Integration Points

### Backend Communication
- All API calls go through centralized client with error handling
- Automatic camelCase/snake_case conversion
- JWT authentication on all requests
- Structured error responses

### Storage Strategy
- Sensitive data (tokens, device ID) in Expo SecureStore
- App state and preferences in context providers
- Onboarding completion in secure storage

### Cross-Platform Considerations
- Platform-specific hooks for web compatibility
- Responsive design with screen dimension utilities
- Platform-specific notification channel setup

### Error Handling
- Centralized API error handling with user-friendly messages
- Fallback quest data when API unavailable
- Graceful degradation for missing permissions

---

## Development Notes

### Project Structure Philosophy
- Feature-based organization (auth, quests, profile)
- Separation of concerns (API, UI, state management)
- Reusable component library approach
- Type-first development with comprehensive TypeScript

### State Management Strategy
- Context providers for global state
- useReducer for complex state updates
- Local component state for UI-specific data
- Minimal prop drilling through proper context usage

### Code Quality Features
- Comprehensive TypeScript typing
- Consistent error handling patterns
- Reusable utility functions
- Modular component architecture

This codebase represents a well-structured React Native application with clear separation of concerns, comprehensive state management, and robust error handling. The architecture supports the core gamification concept while maintaining scalability and maintainability.