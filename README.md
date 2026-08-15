# Ashira Jewels — Admin Panel Frontend (v12: DataTable system, edit mode, forced password change)

Next.js App Router (Tailwind v4) + TypeScript, Redux Toolkit, react-hook-form + zod, react-icons.

## What's new in this version

### 1. Reusable DataTable system (the big one)
`src/components/ui/table/` — one generic table implementation, used by Brands, Showrooms,
Employees, and Site Settings' login history. Driven entirely by a `ColumnDef<T>[]` array
(`src/types/dataTable.ts`), so adding a table for a new entity is just writing column definitions,
not a new table component.

- **`DataTable.tsx`** — header/body/footer, desktop table + mobile card fallback, empty state.
- **`TableHeaderCell.tsx`** — sortable columns show stacked up/down arrows next to the label; the
  active sort direction is highlighted in teal, the inactive one dimmed.
- **`Pagination.tsx`** — page nav (first/prev/next/last) + a 10/20/50/100 items-per-page dropdown.
- **`ColumnVisibilityMenu.tsx`** — a "Columns" button revealing a checklist; columns marked
  `defaultVisible: false` start hidden (e.g. Employee's Department/Designation/Employee
  Type/Joining Date) so a wide table starts manageable and the person reveals more as needed.
  Columns marked `alwaysVisible` (the primary name column, Actions) can't be hidden.
- **`showFooter` + a column's `footer` function** — e.g. Brands/Showrooms show a totals row
  summing Showrooms/Employees counts when that column is visible.
- **`src/hooks/useTableController.ts`** — centralizes page/limit/sortBy/order/search state; used
  identically by every list page.

### 2. Popup delete confirmation (was: inline "Delete? Yes/Cancel")
`src/components/ui/ConfirmDialog.tsx` — a real modal (built on the existing `Modal`), used by
every delete action across Brands/Showrooms/Employees. `Button` gained a proper `danger` variant
for this instead of a className hack.

### 3. Edit mode for Brand, Showroom, Employee
`BrandForm`/`ShowroomForm`/`EmployeeForm` now accept optional `editing*Id` + `defaultValues` props
and branch their submit handler between create/update — same form, same validation, no duplicated
UI. New routes: `/brands/[id]/edit`, `/showrooms/[id]/edit`, `/employees/[id]/edit`, each fetching
the record then rendering the form pre-filled. The Employee edit form hides the Login Credentials
section entirely — changing login state goes through the dedicated reset/grant-access icons in the
table, not the general edit form, so credentials can't be silently altered as a side effect of
fixing a typo in someone's address.

### 4. Forced password change (mustChangePassword, actually enforced now)
This was flagged as the top priority gap last round — it's real now:
- `src/schemas/changePasswordSchemas.ts` + `ChangePasswordForm.tsx` + `/change-password` page.
- `AuthGuard.tsx` checks `user.mustChangePassword` and redirects there before anything else in the
  dashboard is reachable — can't be bypassed by navigating directly to another URL, since every
  dashboard page is wrapped in the same guard.
- Every account created with a system-generated temporary password (Brand Admin, Showroom Admin,
  Employee logins) hits this on first login.

### 5. Dashboard wired to real data
`src/redux/slices/dashboardSlice.ts` calls the new `/api/dashboard/stats` endpoint — numbers shown
depend on role (Super Admin sees platform-wide totals, Brand Admin sees their brand's, Showroom
staff see their showroom's). No more hardcoded 12/34/128 placeholders.

### 6. Search/sort/pagination now everywhere
Employees got the same `SearchSortBar` + pagination treatment Brands/Showrooms already had.

## Install / run

Same as before — no new packages this round:
```bash
npm install next react react-dom @reduxjs/toolkit react-redux react-hook-form zod @hookform/resolvers react-icons
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss
```

Start the backend first (needs the new pagination/change-password/dashboard-stats endpoints).

## Honest scope note

I could not run `tsc`/`eslint` in my own sandbox this round (npm registry access was blocked), so
this was verified with brace/paren balance heuristics and careful manual review rather than a real
compile. Run `npm run typecheck` on your end before deploying — if anything surfaces, share the
error and I'll fix it the same way we did the last couple of real bugs.

## Still ahead (from the original punch list — genuinely deferred, not forgotten)

- Real email sending for forgot-password (still logs the token).
- File storage for Logo/Profile Photo (still data URLs).
- Custom roles (from Roles & Permissions → Add Role) aren't assignable on the Employee form yet.
- Refresh-token rotation.
- Automated tests.
- `lastLoginAt`/`passwordChangedAt` aren't surfaced in the UI (Profile page is the natural home).

## Round 3 additions

- **Custom roles actually work now.** Roles created via Roles & Permissions were silently unusable — `Employee.role`/`User.role` had a hardcoded Mongoose `enum`, and role-assignment checks used a static map that never knew about generated custom-role keys. Removed the enum, validation now checks the real `RolePermission` collection. Also added `brandId` scoping to custom roles — previously every brand could see and would eventually assign every other brand's custom roles.
- **Toasts** moved to top-right, 3s auto-dismiss (was bottom-right, 4.5s).
- **Site Settings** now accessible to `brand_admin`, scoped to their own brand's accounts/sessions (was Super Admin only, platform-wide).
- **Profile page** now shows last-login and password-changed timestamps, plus a voluntary "Change password" section (reuses the same form as the forced mustChangePassword flow).
- **Notification system** — bell icon in the navbar (Super Admin / Brand Admin / Showroom Admin only), unread badge, polls every 25s, dropdown feed with mark-as-read / mark-all-read. Fires on employee created/deleted and role created/edited. See the backend README for the "why polling, not websockets" reasoning.
