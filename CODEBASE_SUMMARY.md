# SideQuest - Comprehensive Codebase Analysis

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

## Detailed File Analysis

### Configuration Files

#### `/package.json`
**Purpose**: NPM package configuration and dependency management
**Key Dependencies**:
- **Core**: `expo` (~53.0.22), `react` (19.0.0), `react-native` (0.79.6)
- **Navigation**: `expo-router` (~5.1.5), `@react-navigation/native` (^7.1.6)
- **API**: `apisauce` (^3.2.0), `humps` (^2.0.1), `jwt-decode` (^4.0.0)
- **Storage**: `@react-native-async-storage/async-storage` (^2.2.0), `expo-secure-store` (~14.2.4)
- **Notifications**: `expo-notifications` (~0.31.4)
- **Utilities**: `uuid` (^11.1.0), `react-native-get-random-values` (^1.11.0)
- **UI**: `@expo/vector-icons` (^14.1.0), `react-native-animated-spinkit` (^1.5.2)

**Scripts**:
- `start`: Expo development server
- `android/ios`: Platform-specific builds
- `web`: Web development server
- `test`: Jest testing framework

#### `/app.json`
**Purpose**: Expo application configuration
**Key Settings**:
- App name: "SideQuest", slug: "SideQuest", version: "1.1.2"
- Bundle identifiers: iOS (`com.lkleinbrodt.SideQuest`), Android (`com.lkleinbrodt.SideQuest`)
- Splash screen configuration with raccoon icon
- Plugin configuration for expo-router, expo-secure-store, expo-splash-screen, expo-localization
- EAS project ID and update configuration
- Runtime version and update URL for OTA updates

#### `/eas.json`
**Purpose**: EAS Build configuration for different build profiles
**Build Profiles**:
- **development**: Development client with internal distribution
- **preview**: Internal distribution for testing
- **production**: Auto-increment version numbers for store submission
- CLI version requirement: >= 15.0.9

#### `/tsconfig.json`
**Purpose**: TypeScript compiler configuration
**Configuration**:
- Extends `expo/tsconfig.base` for Expo-specific TypeScript settings
- Strict mode enabled for type checking
- Path aliases: `@/*` maps to root directory for cleaner imports
- Includes all TypeScript files and Expo type definitions

---

### Authentication System (`/auth/`)

#### `/auth/AuthContext.tsx`
**Purpose**: Central authentication provider managing user state and app initialization
**Imports**:
- React hooks: `createContext`, `useContext`, `useState`
- Storage utilities: `getOnboardingCompleted`, `removeOnboardingCompleted`, etc.
- Services: `authService`, `notificationService`
- Types: `OnboardingProfile`
- Utilities: `getOrCreateDeviceId`

**Interface**: `AuthContextType`
- `user`: User object with ID or null
- `onboardingComplete`: Boolean flag
- `loading`: Loading state
- `error`: Error message string
- Methods: `initializeApp()`, `signInWithProfile()`, `signOut()`, `clearError()`

**Key Functions**:
- **`initializeApp()`**: 
  - Initializes notification service
  - Gets/creates device ID
  - Performs anonymous sign-in with backend
  - Stores JWT token and user data
  - Checks onboarding completion status
- **`signInWithProfile(profile)`**: 
  - Signs in with user profile during onboarding
  - Stores authentication data
  - Marks onboarding as complete
- **`signOut()`**: 
  - Clears all stored authentication data
  - Resets user and onboarding state

**State Management**: Uses React hooks for local state, integrates with secure storage

#### `/auth/storage.tsx`
**Purpose**: Secure storage utilities for authentication data persistence
**Imports**:
- `@react-native-async-storage/async-storage` for general app data
- `expo-secure-store` for sensitive authentication data

**Key Functions**:
- **Token Management**:
  - `storeToken(token)`: Securely stores JWT token
  - `getToken()`: Retrieves stored JWT token
  - `removeToken()`: Deletes stored token
- **User Data Management**:
  - `storeUser(userData)`: Stores user object as JSON string
  - `getUser()`: Retrieves and parses user data
  - `removeUser()`: Deletes stored user data
- **Onboarding State**:
  - `storeOnboardingCompleted(completed)`: Tracks onboarding completion
  - `getOnboardingCompleted()`: Checks if onboarding is complete
  - `removeOnboardingCompleted()`: Resets onboarding state

**Storage Strategy**: Uses SecureStore for sensitive data (tokens), AsyncStorage for app state

---

### API Layer (`/api/`)

#### `/api/client.ts`
**Purpose**: Centralized HTTP client with automatic transformations and error handling
**Imports**:
- `apisauce`: HTTP client library
- `humps`: Case conversion utility
- `getApiConfig`: Environment configuration
- `getToken`: Authentication token retrieval

**Key Features**:
- **Base Configuration**: 30-second timeout, JSON headers, configurable base URL
- **Request Transforms**:
  - Automatic JWT token injection in Authorization header
  - Converts camelCase request data to snake_case for backend compatibility
  - Applies to both request body and query parameters
- **Response Transforms**:
  - Handles standardized API wrapper format (`{ data: ... }` or `{ error: ... }`)
  - Converts snake_case response data to camelCase
  - Centralizes error handling with structured error format
- **Error Handling**: Custom `ApiError` interface with message and code fields

**Exported Client**: Wrapper with async methods (`get`, `post`, `put`, `delete`) that throw structured errors

#### `/api/config.ts`
**Purpose**: API configuration and endpoint definitions
**Imports**: Environment configuration utilities

**Configuration**:
- **Base URL**: Environment-dependent API base URL
- **Endpoints**: Centralized endpoint definitions for:
  - Authentication endpoints
  - Quest management endpoints
  - Profile management endpoints
  - Voting system endpoints
  - Notification endpoints

#### `/api/services/authService.ts`
**Purpose**: Authentication API service layer
**Imports**:
- API client and endpoints
- Type definitions for authentication responses

**Key Methods**:
- **`signInAnonymously(deviceId, profile?)`**: 
  - Performs anonymous authentication using device ID
  - Optionally includes user profile during onboarding
  - Returns JWT token and user data
  - Handles both new user creation and existing user login

**Data Flow**: Device ID → Backend authentication → JWT token + user data

#### `/api/services/questService.ts`
**Purpose**: Quest management API service layer
**Imports**:
- API client and endpoints
- Quest-related types: `Quest`, `QuestBoard`, `QuestStatus`

**Key Methods**:
- **`getQuestBoard()`**: 
  - Retrieves current quest board
  - Automatically refreshes if stale
  - Tops up with new quests if needed
- **`refreshQuestBoard()`**: 
  - Forces quest board refresh
  - Generates new daily quests
- **`updateQuestStatus(questId, status, feedback?)`**: 
  - Updates individual quest status (accepted, completed, abandoned, declined)
  - Includes optional feedback for completed quests
- **`checkBoardNeedsRefresh()`**: 
  - Checks if quest board is stale (24-hour cycle)
- **History Methods**:
  - `getQuestHistory(params)`: Paginated quest history with filtering
  - `getHistoryStats()`: Statistics (streak, success rate, top categories/tags)
  - `get7DayHistory()`: Recent 7-day quest completion data

**Integration**: Handles both quest board management and historical data analysis

#### `/api/services/votingService.ts`
**Purpose**: Quest template voting system API service
**Imports**:
- API client and endpoints

**Interfaces**:
- **`QuestTemplate`**: Template structure with ID, text, category, difficulty, tags, metadata
- **`QuestTemplateVote`**: Vote record with user, template, and vote direction
- **`VoteStats`**: Aggregated voting statistics with approval rates

**Key Methods**:
- **`getQuestsToVoteOn(limit)`**: 
  - Fetches quest templates user hasn't voted on
  - Generates new templates if none available
- **`submitVote(questTemplateId, vote)`**: 
  - Records thumbs up/down vote
  - Returns vote confirmation
- **`getMyVotes(limit)`**: 
  - Retrieves user's voting history
- **`getTemplateVoteStats(questTemplateId)`**: 
  - Gets voting statistics for specific template

**Purpose**: Enables community-driven quest quality control and data collection

#### `/api/services/profileService.ts`
**Purpose**: User profile management API service
**Imports**:
- API client and endpoints
- User profile types

**Key Methods**:
- **`updateProfile(profileData)`**: 
  - Updates user preferences (categories, difficulty, timing, notes)
  - Handles notification settings
- **`getProfile()`**: 
  - Retrieves current user profile

**Integration**: Works with profile editor components for preference management

#### `/api/services/notificationService.ts`
**Purpose**: Push notification management and scheduling service
**Imports**:
- `expo-notifications`: Expo notification APIs
- `Platform`: Platform-specific configuration

**Key Features**:
- **Singleton Pattern**: Single instance for app-wide notification management
- **Initialization**:
  - Requests notification permissions
  - Configures Android notification channels
  - Sets up notification behavior (alerts, sounds, badges)
- **Daily Notifications**:
  - `scheduleDailyNotification(time)`: Schedules recurring daily reminders
  - `cancelDailyNotifications()`: Cancels existing scheduled notifications
- **Event Listeners**:
  - `addNotificationReceivedListener()`: Handles foreground notifications
  - `addNotificationResponseListener()`: Handles notification taps
- **Permission Management**:
  - `getNotificationSettings()`: Checks current permission status
  - `requestPermissions()`: Requests notification permissions

**Platform Support**: iOS and Android with platform-specific channel configuration

---

### Navigation & Routing (`/app/`)

#### `/app/_layout.tsx`
**Purpose**: Root application layout with provider hierarchy and navigation setup
**Imports**:
- React Native Reanimated for animations
- Expo modules: Notifications, SplashScreen, FontAwesome
- Context providers: AuthProvider, OnboardingProvider, QuestProvider
- React Native utilities: SafeAreaProvider, GestureHandlerRootView
- Navigation: Expo Router Stack
- Services: notificationService
- Hooks: useColorScheme, useFonts

**Key Components**:
- **`RootLayout()`**: 
  - Loads custom fonts (SpaceMono, FontAwesome)
  - Handles font loading errors
  - Prevents splash screen auto-hide during initialization
- **`RootLayoutNav()`**: 
  - Sets up notification listeners for foreground and response handling
  - Wraps app in provider hierarchy: SafeAreaProvider → GestureHandlerRootView → AuthProvider → QuestProvider → OnboardingProvider
  - Configures Expo Router Stack with three main routes:
    - `index`: Loading/authentication gate (no header)
    - `(auth)`: Authentication screens (no header)
    - `(tabs)`: Main app tabs (no header, fade animation)

**Provider Hierarchy**: Ensures proper context availability throughout app

#### `/app/index.tsx`
**Purpose**: App loading screen and authentication gate - the entry point that determines user routing
**Imports**:
- React Native components: ActivityIndicator, StyleSheet, Text, View
- Expo SplashScreen for loading management
- Auth context and routing utilities
- Common components: Error
- Constants: Colors

**Key Component**: `AppLoadingScreen()`
- **State Management**: Uses auth context for user, onboarding status, loading, and error states
- **Initialization**: Triggers `initializeApp()` on mount
- **Routing Logic**:
  - While loading: Shows loading indicator behind splash screen
  - On error: Shows error component with retry functionality
  - User authenticated + onboarding complete: Routes to `/(tabs)`
  - Otherwise: Routes to `/onboarding`
- **Splash Screen Management**: Hides splash screen after routing decision made

**Critical Function**: Acts as the authentication and routing gate for the entire application

#### `/app/+html.tsx`
**Purpose**: Web-specific HTML root template for Expo Router web builds
**Imports**:
- `expo-router/html`: ScrollViewStyleReset for web compatibility

**Key Features**:
- **HTML Structure**: Provides root HTML template with proper meta tags
- **Viewport Configuration**: Mobile-responsive viewport settings
- **ScrollView Reset**: Ensures ScrollView components work consistently on web
- **Dark Mode Support**: CSS media queries for automatic dark/light theme switching
- **Background Colors**: Prevents background color flicker during theme changes

**Web Integration**: Essential for proper web builds with Expo Router

#### `/app/(auth)/_layout.tsx`
**Purpose**: Authentication stack layout for onboarding flow
**Imports**:
- Expo Router Stack

**Configuration**: Simple stack layout with no header, allowing onboarding screens to manage their own navigation

#### `/app/(auth)/onboarding.tsx`
**Purpose**: Entry point for onboarding flow
**Imports**:
- OnboardingFlow component

**Functionality**: Simple wrapper that renders the main onboarding flow component

#### `/app/(tabs)/_layout.tsx`
**Purpose**: Main application tab navigation layout with authentication guards
**Imports**:
- Expo Router: Tabs, Redirect
- Icons: Ionicons from Expo vector icons
- Auth context and constants

**Key Features**:
- **Authentication Guard**: 
  - Checks for authenticated user and completed onboarding
  - Redirects to root if authentication/onboarding incomplete
  - Prevents screen flicker during auth checks
- **Tab Configuration**:
  - **Today** (`index`): Main quest board (sunny icon)
  - **History** (`history`): Quest history and stats (time icon)
  - **Vote** (`vote`): Quest template voting (thumbs-up icon)
  - **Profile** (`profile`): User settings (person icon)
- **Styling**: Consistent tab bar with primary color theming and border styling

**Security**: Ensures only authenticated, onboarded users access main app

#### `/app/(tabs)/index.tsx` - **THE CORE SCREEN**
**Purpose**: Main quest board screen - the primary interface where users interact with their daily quests
**Imports**:
- React Native: Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View
- React hooks: useEffect, useRef, useState
- Components: AnimatedLoading, Error, QuestCard, RefreshSpinner
- Context: useQuest
- Types: QuestFeedback
- Constants: Colors, Layout
- Icons: Ionicons

**State Management**:
- `refreshing`: Pull-to-refresh state
- `activeTab`: Current tab (potential vs active quests)
- `scrollViewRef`: Reference for programmatic scrolling

**Key Features**:

1. **Dual Tab System**:
   - **Potential Tab**: Shows unaccepted quests (status: "potential")
   - **Active Tab**: Shows accepted/completed/abandoned quests
   - Horizontal scrolling between tabs with programmatic and gesture control

2. **Quest Actions**:
   - **Accept Quest**: `handleQuestAccept()` - moves quest from potential to active
   - **Decline Quest**: `handleQuestDecline()` - removes quest from board
   - **Complete Quest**: `handleQuestComplete()` - marks quest complete with feedback
   - **Abandon Quest**: `handleQuestAbandon()` - marks quest as abandoned

3. **Data Loading**:
   - Loads quest board on component mount
   - Pull-to-refresh functionality
   - Automatic quest board refresh when needed
   - Loading states with animated spinners

4. **UI Components**:
   - **Tab Headers**: Switchable tabs with quest counts
   - **Quest Cards**: Displays each quest with category badges, difficulty, and actions
   - **Empty States**: Different messages for empty potential vs active quest lists
   - **Error Handling**: Error display with retry functionality

5. **Responsive Design**:
   - Uses screen dimensions for proper tab scrolling
   - Safe area insets for proper spacing
   - Consistent spacing and styling

**Data Flow**:
1. Component mounts → `loadQuestBoard()` called
2. Quest context fetches data from API
3. Quests filtered by status and displayed in appropriate tabs
4. User actions trigger API calls through quest context
5. Local state updates reflect API changes

**Critical Functionality**: This is where users spend most of their time - viewing, accepting, and managing their daily quests.

#### `/app/(tabs)/vote.tsx`
**Purpose**: Quest template voting screen with swipe-based interface for quality control
**Imports**:
- React Native: Alert, Dimensions, StyleSheet, Text, View
- React hooks: useEffect, useState
- Services: votingService with QuestTemplate interface
- Components: AnimatedLoading, Card, Error
- Icons: Ionicons

**State Management**:
- `questTemplates`: Array of templates to vote on
- `currentIndex`: Current template being viewed
- `loading`: Data loading state
- `error`: Error state
- `voting`: Vote submission state

**Key Features**:

1. **Template Loading**:
   - `loadQuestTemplates()`: Fetches templates user hasn't voted on
   - `loadMoreQuests()`: Loads additional templates when running low
   - Automatic template generation if none available

2. **Voting Interface**:
   - **Thumbs Up**: `handleThumbsUp()` - positive vote
   - **Thumbs Down**: `handleThumbsDown()` - negative vote
   - **Skip**: `handleSkip()` - move to next without voting
   - Navigation buttons for manual template browsing

3. **Vote Submission**:
   - `submitVote()`: Sends vote to backend
   - Removes voted template from local list
   - Automatic loading of more templates when needed
   - Error handling with user alerts

4. **Template Display**:
   - Shows template text, category, difficulty, estimated time
   - Category-specific styling and badges
   - Current position indicator
   - Vote count display

**Data Flow**:
1. Load initial templates on mount
2. User votes on templates
3. Vote sent to backend, template removed locally
4. More templates loaded as needed
5. Continuous voting experience

**Purpose**: Community-driven quest quality improvement and data collection for AI training

#### `/app/(tabs)/history.tsx`
**Purpose**: Quest history and statistics display screen
**Imports**:
- React Native: RefreshControl, ScrollView, StyleSheet, Text, View
- React hooks: useEffect, useState
- Services: questService
- Components: AnimatedLoading, Card, Error
- Icons: Ionicons
- Constants: Colors, Layout

**Interfaces**:
- `HistoryStats`: Statistics structure (streak, success rate, categories, tags)
- `DayHistory`: Daily history structure with quest details

**State Management**:
- `stats`: User statistics data
- `history`: 7-day quest history
- `loading`: Data loading state
- `error`: Error state
- `refreshing`: Pull-to-refresh state

**Key Features**:

1. **Statistics Display**:
   - **Current Streak**: Consecutive days with completed quests
   - **Success Rate**: Percentage of accepted quests completed
   - **Most Completed Category**: Top category with completion count
   - **Top Tags**: Most frequently completed quest tags
   - **Total Counts**: Total completed vs total accepted quests

2. **7-Day History**:
   - Daily breakdown of quest activity
   - Quest details with completion status
   - Category indicators with color coding
   - Completion counts per day

3. **Data Loading**:
   - `loadData()`: Fetches both statistics and history data
   - Pull-to-refresh functionality
   - Error handling with retry capability

4. **Visual Design**:
   - `getCategoryColor()`: Category-specific color coding
   - `getCategoryIcon()`: Category-specific icons
   - Card-based layout for statistics
   - Scrollable history with daily sections

**Data Integration**: Combines multiple API endpoints for comprehensive user activity overview

#### `/app/(tabs)/profile.tsx`
**Purpose**: User profile and settings management screen
**Imports**:
- React Native: ScrollView, StyleSheet, Text, View, Alert
- React hooks: useEffect, useState
- Auth context: useAuth
- Services: profileService
- Components: ProfileEditor, Button, AnimatedLoading, Error
- Types: UserProfile

**State Management**:
- `profile`: User profile data
- `loading`: Profile loading state
- `saving`: Profile saving state
- `error`: Error state

**Key Features**:

1. **Profile Management**:
   - `loadProfile()`: Fetches current user profile
   - `handleSaveProfile()`: Saves profile updates
   - Real-time profile editing with ProfileEditor component

2. **Settings Options**:
   - Quest categories selection
   - Difficulty preferences
   - Time preferences
   - Notification settings
   - Additional notes/preferences

3. **Account Management**:
   - Sign out functionality with confirmation
   - Profile data validation
   - Error handling for save operations

4. **UI Features**:
   - Loading states during data operations
   - Success/error feedback
   - Confirmation dialogs for destructive actions

**Integration**: Works closely with ProfileEditor component and auth context for complete profile management

---

### State Management (`/context/`)

#### `/context/QuestContext.tsx`
**Purpose**: Centralized quest state management using useReducer pattern
**Imports**:
- React hooks: createContext, useContext, useEffect, useReducer, useState
- Services: questService
- Types: Quest

**State Interface**: `QuestState`
- `questBoard`: Array of current quests
- `isLoading`: Loading state
- `error`: Error message
- `lastUpdated`: Timestamp of last update

**Actions**: `QuestAction` union type
- `SET_LOADING`: Updates loading state
- `SET_ERROR`: Sets error message
- `SET_QUEST_BOARD`: Replaces entire quest board
- `UPDATE_SINGLE_QUEST`: Updates individual quest
- `RESET_QUEST_BOARD`: Clears quest board
- `SET_LAST_UPDATED`: Updates timestamp

**Key Methods**:
- **`loadQuestBoard()`**: 
  - Prevents concurrent loading
  - Fetches quest board from API
  - Updates state with quest data
  - Handles errors with fallback
- **`refreshQuestBoard()`**: 
  - Forces quest board refresh
  - Generates new daily quests
- **`updateQuestStatus(questId, status, feedback?)`**: 
  - Updates individual quest status
  - Handles feedback for completed quests
  - Updates local state with API response

**Context Value**: Provides state and methods to consuming components

**Usage Pattern**: Central state management for all quest-related data throughout the app

#### `/context/OnboardingContext.tsx`
**Purpose**: Onboarding flow state management with step navigation
**Imports**:
- React hooks: createContext, useContext, useReducer
- Types: OnboardingProfile

**State Interface**: `OnboardingState`
- `currentStep`: Current onboarding step (0-based)
- `totalSteps`: Total number of steps (2)
- `profile`: Partial profile data being collected
- `isLoading`: Loading state
- `error`: Error message

**Actions**: `OnboardingAction` union type
- `SET_CURRENT_STEP`: Navigate to specific step
- `UPDATE_DATA`: Update profile data
- `SET_LOADING`: Update loading state
- `SET_ERROR`: Set error message
- `RESET_ONBOARDING`: Reset to initial state
- `NEXT_STEP`/`PREVIOUS_STEP`: Step navigation

**Key Methods**:
- **`goToStep(step)`**: Navigate to specific step with bounds checking
- **`nextStep()`/`previousStep()`**: Sequential navigation
- **`updateOnboardingData(data)`**: Merge profile data updates
- **`resetOnboarding()`**: Reset to initial state

**Default Profile**: Pre-selects all quest categories for user convenience

**Context Value**: Provides state, dispatch, and convenience methods for onboarding flow

---

### Components (`/components/`)

#### Common Components (`/components/common/`)

##### `/components/common/Button.tsx`
**Purpose**: Reusable button component with multiple variants and states
**Imports**:
- React Native: TouchableOpacity, Text, StyleSheet, ActivityIndicator
- Constants: Colors

**Props Interface**: `ButtonProps`
- `title`: Button text
- `onPress`: Press handler function
- `variant`: Style variant (primary, secondary, outline, danger)
- `size`: Size variant (small, medium, large)
- `disabled`: Disabled state
- `loading`: Loading state with spinner
- `style`: Additional custom styles

**Key Features**:
- **Variants**: Different visual styles for different contexts
- **Sizes**: Consistent sizing options
- **States**: Disabled and loading states with visual feedback
- **Accessibility**: Proper accessibility labels and hints
- **Styling**: Dynamic styling based on props

**Usage**: Consistent button styling throughout the app

##### `/components/common/Card.tsx`
**Purpose**: Styled card container component for consistent UI layout
**Imports**:
- React Native: View, StyleSheet
- Constants: Colors

**Props Interface**: `CardProps`
- `children`: Card content
- `style`: Additional styles
- `padding`: Padding variant

**Features**:
- **Consistent Styling**: Standardized card appearance
- **Shadow/Elevation**: Platform-appropriate shadows
- **Flexible Content**: Accepts any child components
- **Customizable**: Additional styling options

##### `/components/common/Input.tsx`
**Purpose**: Form input component with consistent styling and validation
**Imports**:
- React Native: TextInput, View, Text, StyleSheet
- React hooks: useState
- Constants: Colors

**Props Interface**: `InputProps`
- Standard TextInput props
- `label`: Input label
- `error`: Error message
- `required`: Required field indicator

**Features**:
- **Label Support**: Consistent label styling
- **Error Handling**: Error message display
- **Validation States**: Visual feedback for validation
- **Accessibility**: Proper accessibility support

##### `/components/common/Error.tsx`
**Purpose**: Error display component with retry functionality
**Imports**:
- React Native: View, Text, TouchableOpacity, StyleSheet
- Icons: Ionicons
- Constants: Colors

**Props Interface**: `ErrorProps`
- `text`: Error message
- `onRetry`: Retry function (optional)

**Features**:
- **Error Display**: Consistent error messaging
- **Retry Functionality**: Optional retry button
- **Icon Support**: Error icon for visual clarity
- **Styling**: Consistent error styling

##### `/components/common/AnimatedLoading.tsx`
**Purpose**: Loading spinner component with animation
**Imports**:
- React Native: View, StyleSheet
- `react-native-animated-spinkit`: Animated spinner library
- Constants: Colors

**Props Interface**: `AnimatedLoadingProps`
- `size`: Spinner size
- `color`: Spinner color
- `type`: Animation type

**Features**:
- **Animated Spinners**: Various animation types
- **Customizable**: Size and color options
- **Consistent Loading**: Standardized loading indicators

##### `/components/common/RefreshSpinner.tsx`
**Purpose**: Pull-to-refresh spinner component
**Imports**:
- React Native: ActivityIndicator, StyleSheet
- Constants: Colors

**Features**:
- **Refresh Indicator**: Consistent refresh styling
- **Platform Support**: Works with RefreshControl
- **Theming**: Matches app color scheme

#### Quest Components (`/components/quests/`)

##### `/components/quests/QuestCard.tsx` - **CRITICAL COMPONENT**
**Purpose**: Main quest display component - the primary UI element users interact with for quest management
**Imports**:
- React Native: Alert, Image, StyleSheet, Text, TouchableOpacity, View
- React hooks: useState
- Components: Button, Card, QuestCompletionModal
- Types: Quest, QuestFeedback, QuestCategory
- Constants: Colors, Layout
- Icons: Ionicons

**Props Interface**: `QuestCardProps`
- `quest`: Quest object with all quest data
- `onAccept`: Accept quest handler
- `onDecline`: Decline quest handler
- `onComplete`: Complete quest handler with feedback
- `onAbandon`: Abandon quest handler
- `showActions`: Whether to show action buttons

**Key Features**:

1. **Visual Design**:
   - **Category Badges**: Image badges for each quest category (fitness, social, etc.)
   - **Difficulty Indicators**: Color-coded difficulty levels (easy=green, medium=yellow, hard=red)
   - **Status Indicators**: Visual feedback for quest status
   - **Category Colors**: Consistent color coding throughout

2. **Quest Information Display**:
   - Quest text with proper typography
   - Category badge with 70px standardized size
   - Estimated time display
   - Difficulty level with color coding
   - Tags display (if available)
   - Creation and expiration dates

3. **Action System**:
   - **Potential Quests**: Accept/Decline buttons
   - **Accepted Quests**: Complete/Abandon buttons
   - **Completed Quests**: Feedback display, completion timestamp
   - **Abandoned Quests**: Abandonment timestamp

4. **Completion Flow**:
   - `handleComplete()`: Opens completion modal
   - `handleFeedbackSubmit()`: Processes completion feedback
   - Integration with QuestCompletionModal for detailed feedback

5. **Helper Functions**:
   - `getCategoryColor()`: Maps categories to brand colors
   - `getCategoryAsset()`: Maps categories to badge images
   - `getDifficultyColor()`: Maps difficulty to status colors

**Asset Management**: Uses local image assets for category badges stored in `/assets/category-badges/`

**State Management**: Local state for completion modal, integrates with parent component callbacks

**Critical Role**: This component is the primary interface for all quest interactions - users see this component most frequently and use it to manage their entire quest experience.

##### `/components/quests/QuestCompletionModal.tsx`
**Purpose**: Modal for quest completion with detailed feedback collection
**Imports**:
- React Native: Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert
- React hooks: useState
- Components: Button
- Types: QuestFeedback
- Constants: Colors, Layout

**Props Interface**: `QuestCompletionModalProps`
- `visible`: Modal visibility
- `quest`: Quest being completed
- `onClose`: Close modal handler
- `onSubmit`: Feedback submission handler

**Key Features**:

1. **Feedback Collection**:
   - **Rating**: Thumbs up/down for quest quality
   - **Time Spent**: Actual time spent on quest
   - **Comments**: Optional text feedback
   - **Completion Status**: Completed vs abandoned

2. **UI Components**:
   - **Rating Buttons**: Visual thumbs up/down selection
   - **Time Input**: Numeric input for time spent
   - **Comment Field**: Multi-line text input
   - **Action Buttons**: Submit/Cancel options

3. **Validation**:
   - Required field validation
   - Time input validation
   - Feedback completeness checks

4. **Data Flow**:
   - Collects all feedback data
   - Validates input
   - Submits structured feedback object
   - Closes modal on successful submission

**Integration**: Works closely with QuestCard for seamless completion flow

#### Onboarding Components (`/components/onboarding/`)

##### `/components/onboarding/OnboardingFlow.tsx`
**Purpose**: Main onboarding flow coordinator component
**Imports**:
- React Native: View, StyleSheet
- Context: useOnboarding
- Components: OnboardingWelcome, OnboardingPreferences

**Key Features**:
- **Step Management**: Renders appropriate component based on current step
- **Flow Control**: Coordinates between onboarding steps
- **Context Integration**: Uses onboarding context for state management

**Step Mapping**:
- Step 0: OnboardingWelcome
- Step 1: OnboardingPreferences

##### `/components/onboarding/OnboardingWelcome.tsx`
**Purpose**: Welcome screen with app introduction
**Imports**:
- React Native: View, Text, Image, StyleSheet, TouchableOpacity
- Context: useOnboarding
- Components: Button
- Constants: Colors, Layout

**Key Features**:
- **App Introduction**: Welcome message and app overview
- **Visual Design**: App logo and branding
- **Navigation**: Continue to preferences step
- **Styling**: Consistent with app theme

##### `/components/onboarding/OnboardingPreferences.tsx`
**Purpose**: Main preferences collection screen during onboarding
**Imports**:
- React Native: View, ScrollView, StyleSheet, Alert
- React hooks: useState
- Context: useOnboarding, useAuth
- Components: ProfileEditor, Button, AnimatedLoading
- Types: OnboardingProfile

**Key Features**:

1. **Preference Collection**:
   - Uses ProfileEditor component for consistent UI
   - Collects categories, difficulty, time preferences
   - Notification settings
   - Additional notes

2. **Data Management**:
   - `handleProfileUpdate()`: Updates onboarding context
   - `handleComplete()`: Finalizes onboarding process
   - Validation before submission

3. **Integration**:
   - Works with auth context for profile submission
   - Uses onboarding context for state management
   - Transitions to main app on completion

##### `/components/onboarding/OnboardingNotifications.tsx`
**Purpose**: Notification permission setup during onboarding
**Imports**:
- React Native: View, Text, StyleSheet, Alert
- Services: notificationService
- Components: Button
- Constants: Colors

**Key Features**:
- **Permission Request**: Requests notification permissions
- **Settings Configuration**: Sets up notification preferences
- **User Education**: Explains notification benefits
- **Skip Option**: Allows users to skip notifications

##### `/components/onboarding/OnboardingCompletion.tsx`
**Purpose**: Final onboarding step with completion confirmation
**Imports**:
- React Native: View, Text, StyleSheet
- Components: Button
- Constants: Colors

**Key Features**:
- **Completion Confirmation**: Success message
- **App Introduction**: Brief app usage overview
- **Navigation**: Enter main app
- **Celebration**: Positive reinforcement for completion

##### `/components/onboarding/index.ts`
**Purpose**: Export barrel for onboarding components
**Exports**: All onboarding components for clean imports

#### Profile Components (`/components/profile/`)

##### `/components/profile/ProfileEditor.tsx` - **COMPLEX FORM COMPONENT**
**Purpose**: Comprehensive profile editing interface with all user preferences
**Imports**:
- React Native: ScrollView, View, StyleSheet, Alert
- React hooks: useEffect, useState
- Components: CategorySelector, DifficultySelector, TimeSelector, NotificationSettings, AdditionalNotesInput, Button, AnimatedLoading
- Hooks: useAutoSave
- Types: UserProfile
- Services: profileService
- Constants: Colors, Layout

**Props Interface**: `ProfileEditorProps`
- `initialProfile`: Starting profile data
- `onProfileUpdate`: Profile change handler
- `showSaveButton`: Whether to show save button
- `autoSave`: Enable auto-save functionality

**Key Features**:

1. **Comprehensive Editing**:
   - **Categories**: Multi-select quest categories
   - **Difficulty**: Single-select difficulty preference
   - **Time**: Maximum time per quest
   - **Notifications**: Enable/disable with time selection
   - **Additional Notes**: Free-text preferences

2. **Auto-Save Integration**:
   - Uses `useAutoSave` hook for automatic saving
   - Debounced saves to prevent excessive API calls
   - Loading states during save operations

3. **Validation**:
   - Required field validation
   - Data format validation
   - User feedback for validation errors

4. **State Management**:
   - Local state for form data
   - Real-time updates to parent components
   - Error handling for save operations

**Integration**: Central component used in both onboarding and profile settings

##### `/components/profile/CategorySelector.tsx`
**Purpose**: Multi-select interface for quest categories
**Imports**:
- React Native: View, Text, TouchableOpacity, StyleSheet, ScrollView
- Constants: Colors
- Types: QuestCategory

**Props Interface**: `CategorySelectorProps`
- `selectedCategories`: Currently selected categories
- `onCategoriesChange`: Selection change handler
- `disabled`: Disabled state

**Key Features**:
- **Multi-Select**: Toggle multiple categories
- **Visual Feedback**: Selected/unselected states
- **Category Display**: All 8 quest categories
- **Color Coding**: Category-specific colors
- **Scrollable**: Handles overflow on smaller screens

##### `/components/profile/DifficultySelector.tsx`
**Purpose**: Single-select interface for difficulty preference
**Imports**:
- React Native: View, Text, TouchableOpacity, StyleSheet
- Constants: Colors
- Types: QuestDifficulty

**Props Interface**: `DifficultySelectorProps`
- `selectedDifficulty`: Current difficulty selection
- `onDifficultyChange`: Selection change handler
- `disabled`: Disabled state

**Key Features**:
- **Single Select**: Radio button behavior
- **Difficulty Levels**: Easy, Medium, Hard options
- **Color Coding**: Difficulty-specific colors (green, yellow, red)
- **Visual Feedback**: Clear selected state

##### `/components/profile/TimeSelector.tsx`
**Purpose**: Time preference selection interface
**Imports**:
- React Native: View, Text, TouchableOpacity, StyleSheet
- Constants: Colors

**Props Interface**: `TimeSelectorProps`
- `selectedTime`: Current time selection
- `onTimeChange`: Time change handler
- `disabled`: Disabled state

**Key Features**:
- **Time Options**: Predefined time ranges (5, 10, 15, 30, 45+ minutes)
- **Single Select**: One time preference
- **Visual Design**: Consistent with other selectors

##### `/components/profile/NotificationSettings.tsx`
**Purpose**: Notification preference configuration interface
**Imports**:
- React Native: View, Text, Switch, StyleSheet, Platform
- React hooks: useState, useEffect
- Services: notificationService
- Components: Button
- Constants: Colors

**Props Interface**: `NotificationSettingsProps`
- `notificationsEnabled`: Current enabled state
- `notificationTime`: Current notification time
- `onNotificationsChange`: Settings change handler
- `disabled`: Disabled state

**Key Features**:

1. **Permission Management**:
   - Checks current notification permissions
   - Requests permissions when needed
   - Handles permission denied states

2. **Settings Configuration**:
   - **Enable/Disable**: Toggle notifications
   - **Time Selection**: Choose notification time
   - **Schedule Management**: Updates scheduled notifications

3. **Platform Support**:
   - iOS/Android permission handling
   - Platform-specific UI adjustments

##### `/components/profile/AdditionalNotesInput.tsx`
**Purpose**: Free-text input for additional user preferences
**Imports**:
- React Native: View, Text, TextInput, StyleSheet
- Constants: Colors

**Props Interface**: `AdditionalNotesInputProps`
- `value`: Current notes value
- `onChangeText`: Text change handler
- `disabled`: Disabled state

**Key Features**:
- **Multi-line Input**: Large text area for detailed preferences
- **Placeholder Text**: Helpful examples for users
- **Character Limits**: Reasonable text limits
- **Styling**: Consistent with app theme

##### `/components/profile/index.ts`
**Purpose**: Export barrel for profile components with TypeScript types
**Exports**: 
- All profile components
- TypeScript interfaces for props
- Enables clean imports throughout app

---

### Utilities (`/utils/`)

#### `/utils/deviceId.ts`
**Purpose**: Device identification system for anonymous authentication
**Imports**:
- `react-native-get-random-values`: UUID generation support
- `expo-secure-store`: Secure storage
- `uuid`: UUID generation

**Key Functions**:

1. **`getOrCreateDeviceId()`**:
   - **Development Mode**: Returns hardcoded ID for consistent testing
   - **Production**: Generates/retrieves UUID from secure storage
   - **Persistence**: Uses Expo SecureStore with keychain service
   - **Fallback**: Generates temporary UUID if storage fails

2. **`getDeviceId()`**:
   - Retrieves existing device ID without creating new one
   - Returns null if no ID exists

3. **`clearDeviceId()`**:
   - Removes stored device ID (useful for testing/logout)
   - No-op in development mode

**Security Features**:
- Uses secure keychain storage on iOS/Android
- Keychain service: "sidequest.credentials"
- Fallback handling for storage failures

**Development Support**: Hardcoded ID for consistent development experience

#### `/utils/timezone.ts`
**Purpose**: Timezone handling utilities for quest scheduling
**Imports**:
- `expo-localization`: Device locale and timezone detection

**Key Functions**:
- **`getCurrentTimezone()`**: Gets device timezone
- **`validateTimezone()`**: Validates timezone format
- **`formatTimezone()`**: Formats timezone for API

**Integration**: Used for quest board refresh timing and notification scheduling

#### `/utils/fallbackQuests.ts`
**Purpose**: Emergency quest data when API is unavailable
**Imports**:
- Types: Quest, QuestCategory, QuestDifficulty

**Key Features**:
- **Hardcoded Quests**: Pre-written quests covering all categories
- **Category Coverage**: Ensures all 8 categories represented
- **Difficulty Range**: Easy, medium, hard quests available
- **Realistic Data**: Proper quest structure with tags and timing

**Usage**: Provides quest data when backend is unavailable, ensuring app functionality

---

### Custom Hooks (`/hooks/`)

#### `/hooks/useAutoSave.ts`
**Purpose**: Auto-save functionality for forms with debouncing and state management
**Imports**:
- React hooks: useCallback, useEffect, useRef, useState

**Props Interface**: `UseAutoSaveProps`
- `data`: Data to auto-save
- `saveFunction`: Async save function
- `delay`: Debounce delay (default 2000ms)
- `enabled`: Enable/disable auto-save

**Return Interface**: `UseAutoSaveReturn`
- `isSaving`: Current saving state
- `lastSaved`: Timestamp of last save
- `error`: Save error message
- `forceSave`: Manual save trigger

**Key Features**:

1. **Debouncing**: Prevents excessive API calls during rapid changes
2. **State Management**: Tracks saving state, errors, and timestamps
3. **Manual Override**: `forceSave()` for immediate saves
4. **Error Handling**: Captures and exposes save errors
5. **Cleanup**: Proper cleanup of timers and effects

**Usage**: Used in ProfileEditor for seamless user experience

---

### Platform-Specific Files

#### `/components/useColorScheme.ts` & `/components/useColorScheme.web.ts`
**Purpose**: Theme detection with platform-specific implementations
**Imports**:
- React Native: useColorScheme (native)
- Custom implementation for web

**Features**:
- **Native**: Uses React Native's built-in color scheme detection
- **Web**: Custom implementation for web compatibility
- **Consistent API**: Same interface across platforms

#### `/components/useClientOnlyValue.ts` & `/components/useClientOnlyValue.web.ts`
**Purpose**: SSR-safe value handling
**Features**:
- **Native**: Direct value return
- **Web**: Handles server-side rendering safely
- **Type Safety**: TypeScript support for both platforms

---

## Data Flow & Integration Patterns

### Authentication Flow
1. **App Launch**: `app/index.tsx` triggers `AuthContext.initializeApp()`
2. **Device ID**: `utils/deviceId.ts` generates/retrieves unique identifier
3. **Backend Auth**: `api/services/authService.ts` performs anonymous sign-in
4. **Token Storage**: `auth/storage.tsx` securely stores JWT token
5. **Route Decision**: Based on auth status and onboarding completion

### Quest Management Flow
1. **Board Loading**: `context/QuestContext.tsx` manages quest state
2. **API Integration**: `api/services/questService.ts` handles backend communication
3. **UI Updates**: `app/(tabs)/index.tsx` displays quests via `components/quests/QuestCard.tsx`
4. **User Actions**: Quest actions trigger API calls and local state updates
5. **Feedback Loop**: User feedback influences future quest generation

### Profile Management Flow
1. **Data Collection**: `components/profile/ProfileEditor.tsx` comprehensive form
2. **Auto-Save**: `hooks/useAutoSave.ts` debounced saves
3. **API Updates**: `api/services/profileService.ts` backend synchronization
4. **Context Updates**: Profile changes propagate through app

### Notification Flow
1. **Permission Request**: `api/services/notificationService.ts` handles permissions
2. **Scheduling**: Daily notifications scheduled based on user preferences
3. **Delivery**: Expo Notifications handles platform-specific delivery
4. **Response Handling**: App responds to notification taps and interactions

This comprehensive analysis covers every meaningful file in the SideQuest codebase, providing detailed insights into functionality, integration patterns, and architectural decisions. Each component serves a specific purpose in delivering the gamified daily quest experience to users.