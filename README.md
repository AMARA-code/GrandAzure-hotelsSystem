Grand Azure Hotel Group
Multi-property hotel management SaaS — a single dashboard for managing bookings, staff, housekeeping, inventory, restaurants, and loyalty programs across multiple hotel properties, with an integrated JazzCash payment flow and an AI-powered guest assistant.
Live demo: https://grandazure.co
Overview
Grand Azure is built for hotel groups that operate more than one property and need a unified system rather than per-hotel spreadsheets or disconnected tools. It handles the full operational loop: a guest books a room (with online JazzCash payment or pay-at-hotel), staff manage check-in/checkout, housekeeping and maintenance are scheduled per room, and management gets real-time analytics across the whole portfolio.
Architecture
Multi-property data model — every core entity (rooms, staff, bookings, restaurants, departments) is scoped to a hotel_id, so the same schema and UI serve one hotel or twenty without structural changes.
Booking & payment state machine — bookings move through explicit states (pending → pending_payment → pending_approval → confirmed → checked_in → checked_out), and payments have a parallel state machine (pending_verification → verified → completed) to support JazzCash's manual-verification flow: guest pays via JazzCash, uploads a screenshot + transaction ID, and an admin verifies it before the booking is confirmed.
Role-scoped dashboard — department and role tables (staff, roles, departments) drive what each dashboard section shows, covering bookings, front desk, housekeeping, maintenance, inventory, finance, loyalty, and conference/event bookings.
Real-time analytics — occupancy, revenue, and arrivals are computed from live Supabase data and rendered with Recharts on the dashboard (OccupancyChart, RevenueChart, TodayArrivals).
AI guest assistant — a /api/chat route pulls live hotel context (hotels, room types, restaurants, room availability, menu items) from Supabase and feeds it to an LLM so the assistant answers with real, current data instead of a static script.
Auth & data access — Supabase Auth with SSR-aware clients (lib/supabase/server.ts, client.ts) and a service-role client reserved for privileged operations like payment verification.
Stack: Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres + Auth + Realtime), Tailwind CSS v4, shadcn/ui + Radix primitives, Recharts, React Hook Form + Zod, Resend/Nodemailer for transactional email.
What I designed vs. what AI generated
I own the architecture and the review layer: the multi-tenant schema and hotel_id scoping strategy, the booking/payment state machines (including the JazzCash manual-verification flow, since JazzCash has no clean webhook-based confirmation for this use case), the module breakdown (housekeeping/maintenance/inventory/loyalty as separate concerns), and the data shape feeding the AI chat assistant.
AI tools (Claude/Copilot) generated a large share of the component boilerplate, CRUD forms, and repetitive dashboard UI, which I reviewed, corrected, and integrated against the schema and state machines above.
Core modules
Bookings (create, edit, payment, confirmation)
Front desk / guest management
Housekeeping scheduling
Maintenance requests
Inventory
Staff management
Restaurants & in-house dining orders
Loyalty program (tiers, points, transactions)
Conference/event bookings
Finance & analytics dashboard
Reviews
Getting Started
Bash
Open http://localhost:3000 to view the app locally (this is just the local dev address — the live site is at grandazure.co).
Set up a .env.local with your Supabase project URL, anon key, and service role key (required for the payment verification and AI chat routes).
Deployment
Deployed on Vercel. Push to main to trigger a production deploy.
