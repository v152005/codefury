# Vocallyze — Main Functionality Development Workflow

## 1. Purpose

The authentication and accessibility onboarding foundation is complete.

The next phase is to implement the **core functionality of Vocallyze**: helping users access digital services through a single interface that adapts to their accessibility preferences.

The core principle is:

> **One service engine, multiple interaction modes.**

Do not build separate business logic for text users, voice users, or conversational users. All interaction modes must ultimately operate on the same service/form engine.

---

# 2. Product Flow

```text
                    USER
                     │
                     ↓
              Authentication
                     │
                     ↓
          Accessibility Profile
                     │
                     ↓
               Dashboard
                     │
                     ↓
              Service Selection
                     │
                     ↓
              Service Engine
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Text UI    Voice UI   Conversational UI
          │          │          │
          └──────────┼──────────┘
                     ↓
              Form/Task Engine
                     │
                     ↓
                 Validation
                     │
                     ↓
             User Confirmation
                     │
                     ↓
                Submission
                     │
                     ↓
             Status / Feedback
```

---

# 3. Core Architecture

The application should have five major layers:

```text
Presentation Layer
        ↓
Interaction Layer
        ↓
Service Engine
        ↓
Validation / Application Layer
        ↓
Persistence / External Services
```

### Presentation Layer

Responsible for:

- Dashboard
- Service cards
- Forms
- Progress indicators
- Confirmation screens
- Accessibility controls

### Interaction Layer

Responsible for:

- Text interaction
- Voice input
- Voice output
- Transcription
- Conversational interaction

### Service Engine

Responsible for:

- Service definitions
- Required fields
- Questions
- Form progression
- Service-specific rules

### Validation / Application Layer

Responsible for:

- Validating answers
- Detecting missing information
- Detecting invalid information
- Generating useful feedback
- Preparing submissions

### Persistence / External Services

Responsible for:

- User profile
- Application data
- Application status
- AI services
- Speech services
- External APIs when required

---

# 4. Dashboard

After authentication and onboarding:

```text
Login
  ↓
Get user profile
  ↓
Profile exists
  ↓
Dashboard
```

The dashboard should be personalized using the saved accessibility profile.

Example:

```text
Good morning!

What would you like to do?

┌──────────────────────────┐
│ Apply for a Certificate  │
└──────────────────────────┘

┌──────────────────────────┐
│ Pension Services         │
└──────────────────────────┘

┌──────────────────────────┐
│ Government Applications  │
└──────────────────────────┘

┌──────────────────────────┐
│ Check Application Status  │
└──────────────────────────┘
```

The exact service list should be configurable rather than hard-coded throughout the frontend.

---

# 5. Service Selection

Create a common service model.

Example:

```json
{
  "id": "pension-certificate",
  "name": "Pension Certificate",
  "description": "Apply for a pension certificate",
  "category": "government",
  "enabled": true
}
```

The frontend should request or consume a list of available services.

Do not duplicate service definitions across multiple pages.

---

# 6. Service Engine

The Service Engine is the most important part of the application.

It should define a service as a collection of questions/fields and rules.

Example:

```json
{
  "id": "pension-certificate",
  "name": "Pension Certificate",

  "fields": [
    {
      "id": "fullName",
      "label": "What is your full name?",
      "type": "text",
      "required": true
    },
    {
      "id": "dateOfBirth",
      "label": "What is your date of birth?",
      "type": "date",
      "required": true
    },
    {
      "id": "phone",
      "label": "What is your phone number?",
      "type": "phone",
      "required": true
    }
  ]
}
```

The engine should determine:

- Current question
- Next question
- Previous question
- Required fields
- Field type
- Validation rules
- Progress
- Completion

---

# 7. Do Not Build Forms Manually for Every Interaction Mode

Avoid:

```text
Text Pension Form
Voice Pension Form
Kannada Pension Form
English Pension Form
Conversational Pension Form
```

Instead:

```text
             Pension Service
                    │
              Service Schema
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
      Text        Voice    Conversation
        │           │           │
        └───────────┼───────────┘
                    ↓
              Same Answers
                    ↓
              Same Validator
```

This allows additional services and languages to be added without rewriting the application.

---

# 8. Progressive Form Interaction

Do not overwhelm the user with a large form.

Prefer:

```text
Question 1
    ↓
Answer
    ↓
Question 2
    ↓
Answer
    ↓
Question 3
    ↓
...
    ↓
Review
```

Example:

```text
What is your date of birth?

[ 12 / 06 / 1998 ]

                    Continue →
```

For voice mode:

```text
Assistant:
"What is your date of birth?"

User:
"12 June 1998"

Assistant:
"I heard 12 June 1998. Is that correct?"

User:
"Yes"
```

Both interactions must produce the same internal value:

```json
{
  "dateOfBirth": "1998-06-12"
}
```

---

# 9. Interaction Modes

The application should support three primary modes.

## 9.1 Text Mode

Normal visual interface.

```text
Question
   ↓
Input
   ↓
Validation
   ↓
Next
```

Use when the user's profile indicates normal text interaction or visual interaction.

---

## 9.2 Voice Mode

```text
User speaks
     ↓
Speech-to-Text
     ↓
Recognized text
     ↓
Answer extraction
     ↓
Validation
     ↓
Stored field value
     ↓
Text-to-Speech
     ↓
User hears response
```

Example:

```text
User:
"My date of birth is 12 June 1998."

STT:
"My date of birth is 12 June 1998."

Answer extraction:
12 June 1998

Normalized value:
1998-06-12
```

---

## 9.3 Conversational Mode

The user should be able to describe what they want naturally.

Example:

```text
User:
"I want to apply for a pension certificate."

Assistant:
"Sure. I can help you with that."

Assistant:
"What is your full name?"

User:
"My name is Ravi Kumar."

Assistant:
"Thank you. What is your date of birth?"
```

The conversation must still operate on the same service schema and form state.

The AI must not independently invent required fields.

The service definition remains the source of truth.

---

# 10. Accessibility Preference Integration

The profile created during onboarding controls the interaction experience.

Example profile:

```json
{
  "preferredLanguage": "kn",

  "interactionPreferences": {
    "voiceInput": true,
    "voiceOutput": true,
    "transcription": true,
    "conversationalGuidance": true,
    "simplifiedInstructions": true
  }
}
```

The application can automatically configure:

```text
Language → Kannada
Voice Input → Enabled
Voice Output → Enabled
Transcription → Enabled
Conversation → Enabled
Simplified Instructions → Enabled
```

Do not hard-code these preferences into individual components.

Create a centralized accessibility/preferences context or configuration layer.

---

# 11. Language Architecture

Language should be treated as configuration.

Example:

```js
preferredLanguage: "en"
```

or:

```js
preferredLanguage: "kn"
```

Do not create separate application logic for each language.

Use translation resources such as:

```text
translations/
    en.json
    kn.json
    hi.json
```

Example:

```json
{
  "continue": "Continue",
  "back": "Back",
  "confirm": "Confirm",
  "whatIsYourName": "What is your name?"
}
```

The service data and UI text should be separable from the translation layer.

---

# 12. Form State

Maintain one canonical form state.

Example:

```js
const formState = {
  serviceId: "pension-certificate",

  answers: {
    fullName: "Ravi Kumar",
    dateOfBirth: "1998-06-12",
    phone: "9876543210"
  },

  currentField: "phone",

  completedFields: [
    "fullName",
    "dateOfBirth"
  ]
};
```

Text, voice, and conversational interaction must update this same state.

---

# 13. Validation

Every field must have validation rules.

Example:

```json
{
  "id": "phone",
  "type": "phone",
  "required": true,
  "validation": {
    "pattern": "^[0-9]{10}$"
  }
}
```

If invalid:

```text
Normal UI:
"Please enter a valid 10-digit phone number."

Voice:
"The phone number should contain 10 digits. Please say it again."

Conversation:
"It looks like the phone number is incomplete. Could you provide the 10-digit number again?"
```

The underlying validation rule remains identical.

---

# 14. Error Handling

Errors should be converted into accessibility-appropriate feedback.

Example:

```text
Validation Error
      ↓
Error Message
      ↓
User's Preferred Interaction
```

If:

```js
voiceOutput === true
```

the error can be spoken.

If:

```js
transcription === true
```

the spoken feedback should also be visible as text.

Never make voice-only errors with no visible equivalent when transcription is enabled.

---

# 15. Review Before Submission

Before submission, show the user a summary.

Example:

```text
Review your application

Name:
Ravi Kumar

Date of birth:
12 June 1998

Phone:
9876543210

[Edit]       [Confirm & Submit]
```

For voice interaction:

```text
"I have your information ready.
Your name is Ravi Kumar.
Your date of birth is 12 June 1998.
Your phone number ends in 3210.

Would you like to submit?"
```

The user must explicitly confirm before the final submission.

---

# 16. Submission

After confirmation:

```text
Review
  ↓
User Confirmation
  ↓
POST application
  ↓
Backend validation
  ↓
Save application
  ↓
Return application ID
  ↓
Confirmation
```

Example response:

```json
{
  "success": true,
  "applicationId": "APP-2026-00124",
  "status": "submitted"
}
```

Never show a successful submission before the backend confirms it.

---

# 17. Confirmation Page

Example:

```text
Application submitted successfully.

Application ID:
APP-2026-00124

Status:
Submitted

[View Application]
[Back to Dashboard]
```

Voice mode should provide equivalent feedback.

---

# 18. Application Status

The dashboard should eventually contain:

```text
My Applications

Pension Certificate
Status: Submitted

Certificate Request
Status: Processing

Income Certificate
Status: Approved
```

Create a reusable application-status model.

Example:

```json
{
  "applicationId": "APP-2026-00124",
  "serviceId": "pension-certificate",
  "userId": "...",
  "status": "submitted",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

# 19. AI Integration

AI should be added around the service engine, not replace it.

Correct architecture:

```text
User
 ↓
AI / Conversation Layer
 ↓
Service Engine
 ↓
Form State
 ↓
Validator
 ↓
Submission
```

Not:

```text
User
 ↓
AI
 ↓
AI decides everything
 ↓
Database
```

The AI should help with:

- Understanding natural language
- Extracting answers
- Rephrasing questions
- Simplifying explanations
- Conversational guidance
- Multilingual interaction

The deterministic service engine should control:

- Required fields
- Field types
- Validation
- Form progression
- Submission
- Application state

---

# 20. Voice Integration

Voice functionality should also be modular.

Suggested architecture:

```text
VoiceInputService
      ↓
Speech-to-Text
      ↓
Transcript
      ↓
Conversation / Answer Parser
      ↓
Form Engine
```

and:

```text
Form Engine
      ↓
Response Text
      ↓
VoiceOutputService
      ↓
Text-to-Speech
```

Do not put speech API calls directly inside every page component.

---

# 21. Recommended Frontend Structure

Use a structure similar to:

```text
client/
└── src/
    ├── components/
    │   ├── ServiceCard.jsx
    │   ├── AccessibleInput.jsx
    │   ├── VoiceButton.jsx
    │   ├── ProgressIndicator.jsx
    │   ├── FormQuestion.jsx
    │   └── ConfirmationCard.jsx
    │
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── ServiceSelection.jsx
    │   ├── ServiceForm.jsx
    │   ├── ReviewApplication.jsx
    │   └── ApplicationConfirmation.jsx
    │
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── AccessibilityContext.jsx
    │   └── ServiceContext.jsx
    │
    ├── services/
    │   ├── api.js
    │   ├── serviceApi.js
    │   ├── voiceService.js
    │   └── aiService.js
    │
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useAccessibility.js
    │   ├── useVoice.js
    │   └── useServiceForm.js
    │
    ├── utils/
    │   ├── validation.js
    │   ├── formatters.js
    │   └── translations.js
    │
    └── routes/
        └── AppRoutes.jsx
```

Adapt this structure to the existing frontend codebase rather than blindly duplicating files.

---

# 22. Recommended Backend Structure

Keep the existing MVC-style backend.

```text
server/
├── config/
│   └── firebase.js
│
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── serviceController.js
│   └── applicationController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── userModel.js
│   ├── serviceModel.js
│   └── applicationModel.js
│
├── routes/
│   ├── profileRoutes.js
│   ├── serviceRoutes.js
│   └── applicationRoutes.js
│
├── services/
│   ├── userService.js
│   ├── serviceService.js
│   └── applicationService.js
│
└── utils/
    ├── profileValidator.js
    └── serviceValidator.js
```

Follow the existing project conventions if they differ.

---

# 23. API Plan

Initial APIs:

```http
GET  /api/services
GET  /api/services/:serviceId

POST /api/applications
GET  /api/applications
GET  /api/applications/:applicationId
```

Existing profile APIs:

```http
POST /api/profile
GET  /api/profile
```

All user-specific APIs must require the Firebase authentication middleware.

---

# 24. First Real Service

Do not implement ten services simultaneously.

Choose **one representative service** and make it work completely.

The first service should demonstrate:

```text
Service Selection
       ↓
Question-by-question Form
       ↓
Validation
       ↓
Voice/Visual interaction
       ↓
Review
       ↓
Confirmation
       ↓
Backend Submission
       ↓
Application ID
       ↓
Status
```

Once this pipeline works, other services can reuse the same engine.

---

# 25. Development Order

Implement in this exact order:

### Phase 1 — Service Foundation

1. Create service model/schema.
2. Create service list API.
3. Create service details API.
4. Create the first service definition.
5. Display services on dashboard.

### Phase 2 — Form Engine

6. Build reusable question component.
7. Build form state management.
8. Implement field progression.
9. Implement validation.
10. Implement progress indicator.
11. Implement back/next navigation.

### Phase 3 — Review and Submission

12. Build review screen.
13. Add explicit confirmation.
14. Create application API.
15. Save application to Firestore.
16. Return application ID.
17. Build confirmation page.

### Phase 4 — Accessibility Integration

18. Load the user's accessibility profile.
19. Create centralized accessibility context.
20. Enable/disable voice controls based on preferences.
21. Enable transcription based on preferences.
22. Apply preferred language.
23. Apply simplified instructions.

### Phase 5 — Voice

24. Create voice input service.
25. Add speech-to-text.
26. Convert speech into form answers.
27. Add text-to-speech.
28. Provide spoken validation feedback.
29. Provide spoken confirmation.

### Phase 6 — Conversational AI

30. Add conversational assistant.
31. Connect assistant to service schemas.
32. Extract answers from natural language.
33. Maintain conversation state.
34. Prevent AI from bypassing validation.
35. Support multilingual conversation.

### Phase 7 — Application Tracking

36. Build My Applications.
37. Display status.
38. Display application details.
39. Add status updates.

---

# 26. MVP Boundary

For the first working MVP, prioritize:

```text
Authentication
      ↓
Accessibility Profile
      ↓
Dashboard
      ↓
One Real Service
      ↓
Accessible Form
      ↓
Validation
      ↓
Review
      ↓
Submission
      ↓
Confirmation
```

Voice and AI should be integrated only after the deterministic service flow works.

The MVP should not depend on AI for basic form completion.

---

# 27. Important Engineering Rules

1. Keep business logic out of React components.
2. Keep API calls inside service/API modules.
3. Keep validation centralized.
4. Keep service definitions centralized.
5. Do not duplicate form logic for different interaction modes.
6. Do not duplicate services for different languages.
7. Do not trust frontend user IDs.
8. Always authenticate protected backend routes.
9. Do not expose Firebase service-account credentials.
10. Do not commit `.env` or `firebase-authentication.json`.
11. AI must not be the source of truth for required fields.
12. Always validate on the backend.
13. Require explicit confirmation before submission.
14. Keep accessibility preferences centralized.
15. Build one complete service before adding multiple services.

---

# 28. Definition of Done for the First Main Feature

The first main feature is considered complete when a newly registered user can:

```text
Login
  ↓
Load accessibility profile
  ↓
Open dashboard
  ↓
Choose a service
  ↓
Answer questions
  ↓
Use their configured interaction mode
  ↓
Receive validation feedback
  ↓
Review answers
  ↓
Confirm submission
  ↓
Receive application ID
  ↓
See application status
```

The same service must use the same underlying form and validation logic regardless of whether the user interacts through text, voice, or conversation.

---

# Final Architecture

```text
                         VOCALYZE
                             │
             ┌───────────────┴────────────────┐
             │                                │
       Authentication                 Accessibility Profile
             │                                │
             └───────────────┬────────────────┘
                             ↓
                         Dashboard
                             │
                             ↓
                    Service Selection
                             │
                             ↓
                     SERVICE ENGINE
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
           Text UI        Voice UI    Conversation UI
              │              │              │
              └──────────────┼──────────────┘
                             ↓
                       Form State
                             ↓
                         Validator
                             ↓
                          Review
                             ↓
                       Confirmation
                             ↓
                       Application API
                             ↓
                         Firestore
                             ↓
                    Application Status
```

The key design goal is to make **accessibility an interaction layer over the same underlying service**, rather than building separate applications for different users.
