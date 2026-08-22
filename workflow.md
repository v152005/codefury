# VOCALYZE — Document Snap-to-Form Auto-Fill Workflow

## 1. Goal

Add a document accessibility feature that lets a user upload or photograph a structured document, run OCR locally in the browser, extract only the fields required by the active service, review them, and use them to auto-fill the existing form.

Initial document targets:
- Aadhaar-like demo document
- Ration card
- Mark sheet

Use only non-sensitive demo documents during development/demo.

Core flow:

```text
User selects service
      ↓
Existing form opens
      ↓
[Type] [Voice] [Scan Document]
                    ↓
              Camera / Upload
                    ↓
             Tesseract.js OCR
                    ↓
             OCR text
                    ↓
      Clean + deterministic parsing
                    ↓
       Gemini structured extraction
             (only when needed)
                    ↓
          Normalize + validate
                    ↓
          Preview extracted fields
                    ↓
          User edits / confirms
                    ↓
       Existing canonical form state
                    ↓
       Existing validation pipeline
                    ↓
              Review / Submit
```

## 2. Design Principle

OCR is an **input method**, not a separate application flow.

All inputs must populate the same form state:

```text
Text input
Voice → Speech-to-text → Gemini
Document → OCR → Field extraction
                    ↓
              Same form state
                    ↓
                Validation
                    ↓
                Submission
```

Do not create separate OCR forms.

---

## 3. Frontend UX

Add a document option to each relevant form step or form header:

```text
What is your full name?

[ Type manually ]

[ 🎤 Answer by voice ]

[ 📄 Scan a document ]
```

Document scanner screen:

```text
Scan or upload a document

[ 📷 Take Photo ]
[ 📁 Upload Image ]

Supported: JPG, PNG, WebP
```

After capture:

```text
Review image

[ Retake ] [ Scan ]
```

During OCR:

```text
Scanning document...

██████████████░░░░ 72%

Reading document...
```

After extraction:

```text
Detected information

Full name
[ Ramesh Kumar ]

Date of birth
[ 12 March 2004 ]

Address
[ Bengaluru, Karnataka ]

[ Edit ] [ Use These Details ]
```

If fields are missing:

```text
We found 3 fields.

Still needed:
Phone number
Email address
```

Continue the normal form for missing fields.

---

# 4. React Components

Add or adapt:

```text
client/src/components/
    DocumentScanner.jsx
    OCRProgress.jsx
    DocumentPreview.jsx
    ExtractedFields.jsx
```

Suggested hook:

```text
client/src/hooks/
    useDocumentOCR.js
```

Suggested utilities:

```text
client/src/utils/
    ocrParser.js
    fieldMapper.js
    normalization.js
```

Do not duplicate components that already exist.

---

# 5. Tesseract.js

Install:

```bash
npm install tesseract.js
```

Use it client-side.

Pipeline:

```text
Image
 ↓
Tesseract.js
 ↓
OCR text
```

Do not upload the original identity image to the backend just to perform OCR.

Responsibilities of the OCR hook:

- Accept image.
- Start OCR.
- Report progress.
- Return text.
- Handle failure.
- Allow retry.
- Clean up state.

Example conceptual API:

```js
const {
  scanDocument,
  loading,
  progress,
  text,
  error
} = useDocumentOCR();
```

---

# 6. OCR Text Cleaning

OCR can produce:

- Broken lines
- Extra whitespace
- OCR character mistakes
- Incorrect punctuation
- Duplicate content

Create:

```text
cleanOCRText(text)
normalizeWhitespace(text)
extractLabeledValue(text, label)
```

Example:

```text
Raw OCR:
Narne: RAMESH   KUMAR
DOB: 12/03/2004
Addrass: Bengaluru
```

Clean enough for field extraction.

Do not attempt aggressive correction that could invent personal data.

---

# 7. Document Schema

Use a service-aware document schema.

Example:

```json
{
  "documentType": "aadhaar",
  "fields": [
    "fullName",
    "dateOfBirth",
    "address"
  ]
}
```

Mark sheet:

```json
{
  "documentType": "marksheet",
  "fields": [
    "studentName",
    "dateOfBirth",
    "institution",
    "registrationNumber"
  ]
}
```

Only extract fields needed by the current service.

Example:

```text
Current service needs:
fullName
dateOfBirth
address

Document contains:
name
DOB
address
phone
ID number
photo

Extract only:
fullName
dateOfBirth
address
```

This reduces unnecessary handling of personal data.

---

# 8. Deterministic Field Extraction First

Try normal rules before Gemini.

Example aliases:

```js
{
  "Name": "fullName",
  "Full Name": "fullName",
  "Candidate Name": "fullName",

  "DOB": "dateOfBirth",
  "Date of Birth": "dateOfBirth",

  "Address": "address",
  "Residential Address": "address"
}
```

Use regex/label parsing for predictable documents.

Only use Gemini when the OCR output is unclear or the document layout requires flexible interpretation.

---

# 9. Gemini Document Parsing

Never expose the Gemini API key in React.

Architecture:

```text
React
  ↓
Express
  ↓
Gemini
  ↓
Express
  ↓
React
```

Create:

```text
services/geminiService.js
controllers/aiController.js
routes/aiRoutes.js
```

Endpoint:

```http
POST /api/ai/parse-document
```

Request:

```json
{
  "documentType": "aadhaar",
  "ocrText": "OCR RESULT",
  "requiredFields": [
    "fullName",
    "dateOfBirth",
    "address"
  ]
}
```

Expected response:

```json
{
  "documentType": "aadhaar",
  "fields": {
    "fullName": "Ramesh Kumar",
    "dateOfBirth": "2004-03-12",
    "address": "Bengaluru, Karnataka"
  },
  "confidence": {
    "fullName": 0.98,
    "dateOfBirth": 0.96,
    "address": 0.89
  }
}
```

Use structured JSON output.

Prompt rules:

```text
- Extract only requested fields.
- Do not invent missing values.
- Return null when unavailable.
- Normalize dates only when unambiguous.
- Preserve names where possible.
- Return confidence per field.
```

---

# 10. Data Normalization

Normalize before inserting values into the form.

Examples:

```text
+91 98765 43210
→ 9876543210

RAMESH   KUMAR
→ Ramesh Kumar

12/03/2004
→ 2004-03-12
```

Do not guess ambiguous dates.

If OCR says:

```text
03/12/04
```

and the format cannot be determined reliably, require user confirmation instead of guessing.

---

# 11. Confidence Handling

Use:

```text
>= 0.90
→ Populate and ask confirmation.

0.70–0.89
→ Populate but highlight for review.

< 0.70
→ Do not auto-accept.
   Ask the user to correct/re-enter.
```

Example:

```text
✓ Full name
  Ramesh Kumar

✓ Date of birth
  12 March 2004

⚠ Address
  Bengaluru, Karnataka
  Please verify
```

Confidence must never replace deterministic validation.

---

# 12. Canonical Form State

OCR must update the existing form state.

Example:

```js
setFormData(previous => ({
  ...previous,
  fullName: extracted.fullName,
  dateOfBirth: extracted.dateOfBirth,
  address: extracted.address
}));
```

Do not maintain a separate `ocrFormData`.

The same state must be used by:

```text
Manual typing
Voice input
Document OCR
Review
Submission
```

---

# 13. Confirmation

Never auto-submit OCR results.

Correct:

```text
OCR
 ↓
Extract
 ↓
Preview
 ↓
User confirmation
 ↓
Populate form
 ↓
Validate
 ↓
Submit only after final confirmation
```

Example:

```text
We found these details:

Name: Ramesh Kumar
DOB: 12 March 2004
Address: Bengaluru, Karnataka

[ Use These Details ]
[ Edit ]
```

---

# 14. Combining OCR with Voice

After document scan:

```text
Document
 ↓
OCR
 ↓
Name + DOB + Address filled
 ↓
Assistant asks:
"What is your phone number?"
 ↓
User presses microphone
 ↓
Speech-to-text
 ↓
Gemini extracts phone number
 ↓
Phone field filled
 ↓
Confirm
```

This is the strongest combined demo.

---

# 15. Form-Aware Workflow

The feature should be aware of the current service.

Example:

```text
Pension Certificate
required fields:
- fullName
- dateOfBirth
- address
- phone
```

Document extraction should attempt to fill only those fields.

Do not extract/store unrelated document data unless required.

---

# 16. Backend APIs

Existing profile/auth APIs remain unchanged.

Add/use:

```http
GET /api/services
GET /api/services/:serviceId

POST /api/ai/parse-document

POST /api/applications
GET /api/applications
GET /api/applications/:id
PATCH /api/applications/:id
POST /api/applications/:id/submit
```

Protect user/application routes with the existing Firebase auth middleware.

Never accept a user ID from the frontend. Use:

```js
req.user.uid
```

---

# 17. Privacy and Security

Identity documents can contain highly sensitive information.

Rules:

1. Prefer client-side OCR.
2. Do not permanently store the original image unless required.
3. Do not log raw OCR text containing personal data.
4. Do not log identity numbers.
5. Send only required OCR text/fields for AI processing.
6. Do not commit document images.
7. Never expose the Gemini API key in frontend code.
8. Never expose the Firebase service-account JSON.
9. Require confirmation before using extracted values.
10. Do not use real participant identity documents in the demo.

Use only safe demo documents for the hackathon.

---

# 18. Error Handling

### Invalid file

```text
Please upload a JPG, PNG, or supported image.
```

### Poor image quality

```text
We couldn't read the document clearly.

Try:
- Better lighting
- Keeping the document flat
- Moving the camera closer
```

### OCR failure

```text
We couldn't extract readable text.

Try again or enter the details manually.
```

### Gemini failure

```text
We found the document but couldn't identify
all required fields.

Please review the fields manually.
```

### Missing fields

```text
Some required information was not found.

Please enter the missing fields manually.
```

No OCR failure should block the entire application.

---

# 19. Camera Capture

Optional for the first implementation.

Use:

```html
<input
  type="file"
  accept="image/*"
  capture="environment"
/>
```

This allows supported mobile browsers to open the camera.

Flow:

```text
Camera
 ↓
Capture
 ↓
Preview
 ↓
Retake / Scan
 ↓
Tesseract.js
```

Do not perform OCR until the user confirms the captured image.

---

# 20. Voice + OCR + Text Architecture

The final form engine should support:

```text
                         FORM ENGINE
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
        TYPE                VOICE              DOCUMENT
          │                   │                   │
          │             Speech-to-text        Tesseract.js
          │                   │                   │
          │                   ▼                   ▼
          │              Transcript           OCR text
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ↓
                       Field Extraction
                              ↓
                         Normalize
                              ↓
                           Validate
                              ↓
                        User Confirm
                              ↓
                        Form State
                              ↓
                           Submit
```

This is the architecture that should be preserved as the project expands.

---

# 21. Development Phases

## Phase 1 — Client OCR

Implement:

1. Install Tesseract.js.
2. Create `DocumentScanner`.
3. Add upload.
4. Add preview.
5. Add OCR progress.
6. Return OCR text.
7. Display raw OCR text during development.

## Phase 2 — Field Parsing

Implement:

8. OCR text cleaning.
9. Field aliases.
10. Document schemas.
11. Deterministic extraction.
12. Gemini extraction fallback.
13. Confidence scores.
14. Normalization.

## Phase 3 — Form Integration

Implement:

15. Connect extraction to existing form state.
16. Add extracted-fields preview.
17. Add edit/correction.
18. Add confirmation.
19. Continue existing form workflow.

## Phase 4 — Voice Combination

Implement:

20. Voice input for remaining questions.
21. Transcript display.
22. Gemini response extraction.
23. Merge voice and OCR results into the same form state.

## Phase 5 — Camera and Polish

Implement:

24. Camera capture.
25. Better OCR failure handling.
26. Privacy messaging.
27. Loading states.
28. Mobile responsiveness.
29. Accessibility testing.
30. Demo preparation.

---

# 22. First Vertical Slice

Do not implement all documents/services first.

Make this work:

```text
Pension Certificate
       ↓
Scan demo ID
       ↓
Tesseract.js
       ↓
Extract OCR text
       ↓
Gemini extracts:
- fullName
- dateOfBirth
- address
       ↓
Show preview
       ↓
User confirms
       ↓
Form auto-filled
       ↓
Remaining field:
Phone number
       ↓
Voice input
       ↓
Speech-to-text
       ↓
Gemini extraction
       ↓
Phone auto-filled
       ↓
Review
       ↓
Submit
```

This should be the primary hackathon demo.

---

# 23. Definition of Done

The feature is complete when a user can:

1. Open a supported government service.
2. Select `Scan a document`.
3. Upload or capture a demo document.
4. See OCR progress.
5. Receive extracted fields.
6. Review the extracted values.
7. Correct values.
8. Confirm the values.
9. Automatically populate the existing service form.
10. Continue with fields that were not found.
11. Use voice for remaining fields when enabled.
12. Review the entire application.
13. Submit through the existing application workflow.
14. Receive an application ID/status.

---

# 24. Hackathon Demo Story

The preferred demonstration should be:

```text
User logs in
      ↓
Profile:
Kannada + Voice assistance
      ↓
Select Pension Certificate
      ↓
"Scan your ID to fill details faster"
      ↓
Upload/capture demo document
      ↓
Tesseract.js processes locally
      ↓
Detected:
Name
DOB
Address
      ↓
User confirms
      ↓
Form automatically populated
      ↓
Assistant asks:
"What is your phone number?"
      ↓
User speaks Kannada
      ↓
Speech-to-text
      ↓
Gemini extracts phone number
      ↓
Phone field auto-filled
      ↓
User confirms
      ↓
Review
      ↓
Submit
      ↓
Application ID generated
```

This demonstrates:

```text
Document OCR
    +
Automatic Form Filling
    +
Voice Input
    +
AI
    +
Regional Language
    +
Accessibility
```

---

# 25. Engineering Rules

- Reuse the existing service/form engine.
- OCR is an input method, not a separate application system.
- Prefer deterministic parsing before Gemini.
- Use Gemini only where flexible language understanding is needed.
- Never trust raw AI output without validation.
- Always show extracted sensitive values for confirmation.
- Never auto-submit based on OCR/AI.
- Keep identity-document processing as local as practical.
- Keep Gemini API credentials backend-only.
- Keep Firebase service-account credentials backend-only.
- Do not log personal document content.
- Do not duplicate forms for text/voice/OCR.
- Build one complete vertical slice before adding more document types.
