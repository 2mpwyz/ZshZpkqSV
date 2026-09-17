# Disabled Features Log

**Date**: 2025-05-11
**Purpose**: Archive guest-focused landing page/footer and navbar sections; migrate to provider/service provider focused interface

## Overview

### Part 1: Navigation Sections Disabled
- **Stay** (and all its submenu items)
- **Dine** (and all its submenu items)
- **Experience** (and all its submenu items)

### Part 2: Landing Page & Footer Replaced with Services Context
- **Old guest-focused HomePage**: Disabled but kept intact
- **Old guest-focused Footer**: Disabled but kept intact
- **Old Provider prefix naming**: Renamed to "Services" for broader context coverage
- **New ServicesHomePage**: Now active as the landing page (/)
- **New ServicesFooter**: Now active as the main footer

### Part 3: Profile Page Replaced with Services Context
- **Old guest-focused ProfilePage**: Disabled but kept intact (function exported as `ProfilePageDisabled`)
- **New ServicesProfilePage**: Now active at /profile route
- **Context change**: From guest-centric to services/operations stakeholder focus
- **Maintained functionality**: All database connectivity, form edits, and user data synchronization preserved

All code remains intact in the project for future restoration. Routes and pages are preserved but not advertised in the navbar.

---

## Files Created (New Services-Focused Pages)

### 1. `client/pages/ServicesHomePage.tsx` (NEW)
- **Purpose**: Services stakeholder (providers, managers, coordinators) focused landing page
- **Content Focus**:
  - Task management, performance analytics, resource planning
  - Links to Tasks, Reports, Accounts sections
  - "Experience an Issue?" support form (replicated word-for-word from original)
- **Status**: NOW ACTIVE as the home page (/)

### 2. `client/components/layout/ServicesFooter.tsx` (NEW)
- **Purpose**: Services stakeholder focused footer
- **Content Focus**:
  - Management tools and support resources
  - Links to operational dashboards
  - Services operations terminology and branding
- **Status**: NOW ACTIVE as the main footer

### 3. `client/pages/ServicesProfilePage.tsx` (NEW)
- **Purpose**: Services stakeholder profile page (replaces guest-focused ProfilePage)
- **Context**: Addresses providers, managers, and coordinators with services/operations focus
- **Maintained Features**:
  - All Supabase database connectivity preserved
  - Profile data editing (firstName, lastName, email, phone, birthday, location)
  - Automatic debounced saves to database (500ms delay)
  - User authentication checks and redirect to login if not authenticated
  - All tabs and functionality from original ProfilePage
  - Performance metrics, activity history, tier benefits
  - Referral program and earning opportunities
  - User preferences and notification settings
- **Data Fields**:
  - Personal info: firstName, lastName, email, phone, birthday, location
  - Profile picture management
  - Role type selection (Manager, Service Provider, Coordinator)
  - Task category preferences
  - Notification settings (tasks, reports, alerts, newsletter)
- **Database Sync**: Same real-time sync mechanism as ProfilePage - field updates save automatically
- **Status**: NOW ACTIVE at /profile route

---

## Files Modified

### 1. `client/pages/HomePage.tsx`

#### Change: Disable old guest-focused HomePage
- **What was done**: Renamed function from `HomePage` to `HomePageDisabled`
- **Impact**: Old guest-focused landing page no longer renders at "/"
- **How to restore**:
  1. Rename `HomePageDisabled` → `HomePage` in App.tsx import
  2. Update App.tsx to use original `HomePage` instead of `ServicesHomePage`
  3. Rename Footer back to original
- **Code preserved**: YES - full component remains intact for restoration

### 2. `client/components/layout/Footer.tsx`

#### Change: Disable old guest-focused Footer
- **What was done**: Renamed function from `Footer` to `FooterDisabled`
- **Impact**: Old guest-focused footer no longer renders globally
- **How to restore**: Same process as HomePage above
- **Code preserved**: YES - full component remains intact for restoration

### 3. `client/pages/ProfilePage.tsx`

#### Change: Disable old guest-focused ProfilePage
- **What was done**: Renamed function from `ProfilePage` to `ProfilePageDisabled`
- **Impact**: Old guest-focused profile page no longer renders at /profile
- **Replaced by**: ServicesProfilePage.tsx with services context
- **How to restore**:
  1. Rename `ProfilePageDisabled` → `ProfilePage` in ProfilePage.tsx export
  2. Update App.tsx to use original `ProfilePage` instead of `ServicesProfilePage`
- **Code preserved**: YES - full component remains intact for restoration
- **Database interaction**: Remains functional if restored, no schema changes

### 4. `client/App.tsx`

#### Changes Made:
1. Commented out import: `// import ProfilePage from "./pages/ProfilePage";` (line 13)
2. Replaced import: `ServicesFooter` (previously ProviderFooter) (line 5)
3. Replaced import: `ServicesHomePage` (previously ProviderHomePage) (line 6)
4. Replaced import: `ServicesProfilePage` (new) (line 7)
5. Updated route at `/` to use `ServicesHomePage` (line 43)
6. Updated route at `/profile` to use `ServicesProfilePage` (line 45)
7. Updated footer component from `<Footer />` to `<ServicesFooter />` (line 90)

**Impact**: Platform now displays services-focused interface for all users
**Status**: Changes are functional and active

### 4. `client/components/layout/Header.tsx`

#### Change 1: Disable guestNavItems array (Lines 137-219)
- **What was done**: Renamed `guestNavItems` array to `guestNavItems_disabled` with all Stay/Dine/Experience items intact
- **Created new**: Empty `guestNavItems = []` to prevent rendering
- **Impact**: Navbar no longer displays Stay, Dine, Experience dropdowns
- **How to restore**: Uncomment `guestNavItems_disabled` and rename back to `guestNavItems`

**Original Stay section** (Lines 138-166):
```
- Book a Room → /book
- Special Offers → /offers
- Spa & Wellness → /spa
- Fitness Center → /fitness
```

**Original Dine section** (Lines 167-189):
```
- Digital Menu → /menu
- Room Service → /room-service
- Events & Banquets → /events
```

**Original Experience section** (Lines 190-218):
```
- Travel Desk → /travel
- Concierge → /concierge
- Gift Shop → /shop
- Special Community → /blog
```

#### Change 2: Simplify navigation section headers (Lines 326-350)
- **What was done**: Removed conditional rendering for Stay/Dine/Experience section headers
- **Impact**: Dropdown styling only applies to remaining sections (Tasks, Reports, Accounts)
- **How to restore**: Add back the removed conditions when re-enabling sections

---

## Routes & Pages Status

### Still Accessible via Direct URL (Not Disabled)
All routes remain registered in `client/App.tsx`. If users visit these URLs directly, pages will load:
- `/book` → BookingPage
- `/offers` → OffersPage
- `/spa` → PlaceholderPage
- `/fitness` → PlaceholderPage
- `/menu` → MenuPage
- `/room-service` → (No page found - broken route)
- `/events` → EventsPage
- `/travel` → TravelDeskPage
- `/concierge` → ConciergePage
- `/shop` → ShopPage
- `/blog` → BlogPage

**Note**: These routes were NOT modified. They remain in the app but are not linked from the navbar.

---

## Remaining Active Features

The following navbar sections continue to work normally:
- **Tasks** (with submenu items)
- **Reports** (with submenu items)
- **Accounts** (with submenu items)

Mobile menu is also unaffected for remaining active sections.

---

## How to Restore

### To re-enable Stay, Dine, Experience navbar sections:

1. Open `client/components/layout/Header.tsx`
2. Find the `guestNavItems_disabled` array (around line 137)
3. Rename `guestNavItems_disabled` → `guestNavItems`
4. Delete or comment out the `guestNavItems = []` line
5. Restore the full conditional logic in the section header rendering (lines 326-350) to include Stay/Dine/Experience conditions
6. Save and rebuild

### To restore old guest-focused landing page & footer:

1. Rename in `client/pages/HomePage.tsx`:
   - `HomePageDisabled` → `HomePage`

2. Rename in `client/components/layout/Footer.tsx`:
   - `FooterDisabled` → `Footer`

3. Update `client/App.tsx`:
   - Change import from `ProviderFooter` back to `Footer`
   - Change import from `ProviderHomePage` back to `HomePage`
   - Update route: `<Route path="/" element={<HomePage />} />`
   - Update footer: `<Footer />`

4. Save and rebuild

All original code is preserved exactly as it was, making restoration straightforward.

### Mixed Scenario (Keep navbar changes, revert landing page):
- Keep `guestNavItems = []` (navbar changes)
- Restore HomePage and Footer imports/usage as above
- This allows you to keep the disabled navbar sections while reverting to the guest-focused landing page

---

## Performance Impact

- ✅ Navbar renders faster (fewer items to process)
- ✅ No background loading of disabled menu data
- ✅ Mobile menu is lighter
- ✅ Desktop dropdown rendering is simpler
- ✅ No impact on remaining features (Tasks, Reports, Accounts)

---

## Current Active Pages

- **Home (`/`)**: ServicesHomePage - services stakeholder (providers, managers, coordinators) focused
- **Profile (`/profile`)**: ServicesProfilePage - services stakeholder profile with full database connectivity
- **Footer**: ServicesFooter - service operations focused
- **Navbar**: Tasks, Reports, Accounts (Stay, Dine, Experience disabled)
- **Remaining pages**: All guest-focused pages (Book, Menu, Travel, etc.) still exist and are accessible via direct URL but not linked from navbar

## Testing Checklist for Restoration

When re-enabling Stay, Dine, Experience navbar sections:
- [ ] Verify navbar dropdowns display correctly
- [ ] Check mobile menu renders all items
- [ ] Test all links in Stay, Dine, Experience sections
- [ ] Confirm no console errors
- [ ] Verify Tasks, Reports, Accounts sections still work

When restoring old guest-focused landing page:
- [ ] Verify HomePage displays hero with "Special Guest" greeting
- [ ] Check Footer shows guest-focused links (Book, Menu, Spa, etc.)
- [ ] Test "Experience an Issue?" form still works
- [ ] Confirm all guest-focused CTAs are functional
- [ ] Verify ProviderHomePage and ProviderFooter are not accessible
