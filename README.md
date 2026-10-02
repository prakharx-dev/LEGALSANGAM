# LegalSangam

LegalSangam is a legal-services platform that helps people understand their options, discover advocates, and book consultations across India.

Live application: [legalsangamm.web.app](https://legalsangamm.web.app)
Source repository: [github.com/prakharx-dev/LEGALSANGAM](https://github.com/prakharx-dev/LEGALSANGAM)

## What It Includes

- Advocate discovery with live profiles, search, filters, ratings, languages, fees, and availability
- Advocate detail pages with booking and video-call actions
- Client and lawyer dashboards with profile and consultation information
- AI legal assistant for preliminary guidance and question preparation
- Document review, payments, escrow support, and video-call flows
- Contact, About, Services, and multilingual-accessibility pages
- Firebase Authentication, Firestore, Realtime Database, Storage, and Hosting
- Vercel Node.js API for Razorpay order creation and payment verification
- Responsive dark-and-gold interface for desktop and mobile

## Technology

- React 18 and TypeScript
- Vite
- Tailwind CSS and Radix UI primitives
- React Router
- Firebase Authentication, Firestore, Realtime Database, Storage, and Hosting
- Vercel Node.js Functions for secure Razorpay payments
- Leaflet and React Leaflet for advocate locations
- Google Gemini API for the AI assistant

## Local Setup

Requirements:

- Node.js 20 or newer
- npm
- Firebase project credentials for the features you want to run locally

```bash
git clone https://github.com/prakharx-dev/LEGALSANGAM.git
cd LEGALSANGAM
npm install
```

Create a local `.env` file from the included template:

```powershell
Copy-Item .env.example .env
```

Set the required values in `.env`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_PAYMENT_API_URL=
RAZORPAY_KEY_ID=your_rotated_razorpay_key_id
RAZORPAY_KEY_SECRET=your_rotated_razorpay_key_secret
FIREBASE_PROJECT_ID=prakharx-4c900
FIREBASE_DATABASE_URL=your_firebase_realtime_database_url
FIREBASE_SERVICE_ACCOUNT_JSON=your_service_account_json
APP_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:8081
```

Never commit `.env` or API keys. The repository ignores local environment files and includes only `.env.example`.

For local development and Firebase Hosting, leave `VITE_PAYMENT_API_URL` empty; checkout uses the authenticated Firebase callable payment functions and does not need local Firebase Admin credentials. Configure the server-only values in Vercel Project Settings when using the Vercel API; the Firebase service account JSON and Razorpay secret must remain server-side and must never use a `VITE_` prefix. To use the Vercel API from a Firebase hosted frontend, set `VITE_PAYMENT_API_URL` to its deployment URL and rebuild.

## Development Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

The development server normally runs at `http://localhost:8080/` when that port is available.

## Main Routes

- `/` - Homepage
- `/find` - Advocate search and map
- `/lawyer-details` - Selected advocate profile
- `/services` - Legal areas and consultation formats
- `/ai-legal-assistant` - Preliminary AI guidance
- `/client-dashboard` - Client dashboard
- `/lawyer-dashboard` - Lawyer dashboard
- `/about` - Platform story and principles
- `/contact` - Support form, FAQs, and office map

## Firebase Notes

Firebase configuration is defined in `src/lib/firebase.ts`. Firestore rules and indexes are stored in:

- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`

Deploy Firebase resources with the Firebase CLI after authentication and project selection:

```bash
firebase login
firebase use <project-id>
firebase deploy
```

The current production deployment is hosted at [legalsangamm.web.app](https://legalsangamm.web.app).

Razorpay payments use the Vercel API in `api/payments/` when `VITE_PAYMENT_API_URL` is configured. Firebase Hosting uses the authenticated `createOrder` and `verifyRazorpayPayment` callable functions as its fallback.

## Disclaimer

LegalSangam's AI assistant provides general information and preliminary guidance. It is not a substitute for advice from a qualified advocate. Users should consult a legal professional for decisions about their specific situation.

## Contributors

- [Suryakant Dwivedi](https://github.com/suryakantdwivedi8493)
- [Prakhar Kumar](https://github.com/prakhar1412)
- [Prashant Gupta](https://github.com/prashant2209-cloud)
- [Eklavya Verma](https://github.com/eklavya56)
