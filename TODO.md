# TODO: Apply JSON Theme and Content Updates

## Theme Updates

- [x] Update src/index.css: Change CSS variables to dark theme (background #0F0F0F, foreground #FFFFFF, primary #FFD600, secondary #101010, accent #8A8A8A), set font to serif
- [x] Update tailwind.config.ts: Change fontFamily.sans to serif fonts

## Component Content Updates

- [x] Update src/components/Navbar.tsx: Change logo to SVG, update menu labels to JSON, adjust CTA style/color
- [x] Update src/components/Hero.tsx: Update headline/subheadline/highlight, CTAs, add image, update stats to match JSON
- [x] Update src/components/Footer.tsx: Update tagline, quickLinks, legalAreas, contact, socials, policies, copyright; adjust bg/text for dark theme
- [x] Update src/pages/Services.tsx: Replace services grid with JSON items (AI Legal Assistant, Document Review, Consultation Booking, Community Forum)
- [ ] Update src/pages/Home.tsx: Integrate JSON hero content, adjust to two-column layout if needed

## Global Updates

- [x] Update index.html: Change title and meta description to JSON values

## Followup

- [ ] Place assets (LegalSangam_logo_light.svg, scales_of_justice_dark.png) in public/
- [ ] Test: Run dev server, verify dark theme, serif font, content matches, responsive layout
