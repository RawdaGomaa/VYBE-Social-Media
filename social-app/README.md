# VYBE — Social Media App

A React + TypeScript + Vite application using HeroUI and Tailwind CSS 4. Redesigned from the supplied social-app starter with a Midnight Lavender visual identity.

## Setup

Requires a recent Node.js 22 release (the project dependencies specify Node >=22.22).

```bash
npm ci
npm run dev
npm run build
```

The application calls `https://route-posts.routemisr.com` (see `src/lib/api.ts`). Registration data is empty by default; placeholders do not contain anyone's personal name.

## Assignment coverage (existing React/API implementation preserved)

- Registration & login (Zod and react-hook-form validation)
- Home feed with posts, post details and comments
- View own profile
- Create, edit and delete posts
- Create, edit and delete comments
- Change password in Settings
- Protected routes and logout

Additional pages: community, bookmarks, notifications and user profiles.

## Verification status

The code was checked for the relevant components and API methods. Automated build or live endpoint tests could not be executed in the editing environment because required npm packages were not available in the offline cache. Run `npm ci && npm run build` on your machine, and test using real accounts against the API before submitting.
