# LegalSangam

LegalSangam is a legal-services platform that helps people understand their options, discover advocates, and book consultations across India.

Live application: [legalsangam.web.app](https://legalsangam.web.app)
Source repository: [github.com/prakharx-dev/LEGALSANGAM](https://github.com/prakharx-dev/LEGALSANGAM)

## What It Includes

- Advocate discovery with live profiles, search, filters, ratings, languages, fees, and availability
- Advocate detail pages with booking and video-call actions
- Client and lawyer dashboards with profile and consultation information
- AI legal assistant for preliminary guidance and question preparation
- Document review, payments, escrow support, and video-call flows
- Contact, About, Services, and multilingual-accessibility pages
- Firebase Authentication, Firestore, Storage, Functions, and Hosting integration
- Responsive dark-and-gold interface for desktop and mobile

## Technology

- React 18 and TypeScript
- Vite
- Tailwind CSS and Radix UI primitives
- React Router
- Firebase Authentication, Firestore, Storage, Functions, and Hosting
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
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Never commit `.env` or API keys. The repository ignores local environment files and includes only `.env.example`.

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

## Disclaimer

LegalSangam's AI assistant provides general information and preliminary guidance. It is not a substitute for advice from a qualified advocate. Users should consult a legal professional for decisions about their specific situation.

## Contributors

- [Suryakant Dwivedi](https://github.com/suryakantdwivedi8493)
- [Prakhar Kumar](https://github.com/prakhar1412)
- [Prashant Gupta](https://github.com/prashant2209-cloud)
- [Eklavya Verma](https://github.com/eklavya56)
