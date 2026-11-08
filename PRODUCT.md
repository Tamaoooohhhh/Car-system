# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated (user: "React o lo que se necesite"): React + Vite + Tailwind for the front end; a minimal Node/Express server only for the bot, so the Groq API key lives in a server-side `.env` and never in browser code. Data comes from the provided CSV files, converted to JSON at build time.

## Users

Both segments, equal weight (confirmed):
- **Talleres mecánicos (B2B):** know the references, buy several units, recurring purchase, credit for long-standing clients. Contact by WhatsApp, phone or route advisor.
- **Propietarios de vehículos (B2C):** occasional, cash purchase, usually do not know the exact reference, need compatibility guidance, write at any hour including weekends.
- **Internal users of the CRM demo:** gerencia, coordinación comercial, asesores comerciales, bodega/inventario (a real person manages inventory), administración, gestora de redes (external).

## Product Purpose

CarSystem S.A.S. (Repuestos) is a spare-parts **distributor** in Guayabal, Medellín. The project centralizes its attention channels: a product reference site, a WhatsApp-style bot prototype, and a CRM demo. It is not e-commerce. Every sale starts with a **quotation**; price, availability and lead time are defined only in the quotation by an advisor. Success: the customer gets a fast, coherent first answer and a quotation request with context, while advisors keep the customer relationship.

Company purpose: that no vehicle stays stopped for lack of a part: deliver the right piece, on time, with the advice of someone who knows the trade.

## Positioning

Technical advice plus a made-to-measure quotation (confirmed). An advisor identifies the correct reference from brand, model, plate or a photo of the part, and can source specific pieces on request. The bot filters and prepares; the advisor closes.

## Operating Context

- Seat: Guayabal, Medellín (Antioquia).
- Delivery coverage: Medellín, Bello, Itagüí, Envigado, Sabaneta.
- Hours: Mon–Fri 7:30 a. m.–6:00 p. m.; Sat 7:30 a. m.–1:00 p. m.; Sundays and holidays closed.
- Two daily delivery routes by motorbike, departing 10:00 a. m. and 3:00 p. m. Delivery times are NOT promised; they are confirmed in each quotation.
- WhatsApp and phone cannot be removed; counter service continues.
- Current tooling (from the technology diagnosis): disconnected spreadsheets for quotes, inventory, sales/PQR; shared WhatsApp session on the counter PC; personal advisor phones; accounting/e-invoicing software in the cloud; no systematic backups of conversations; no two-factor authentication; a suspicious "supplier" email attempt (INC-04).
- Inventory is managed by a real person in warehouse; the issue is process and records, not absence of an owner.

## Capabilities and Constraints

- Web: product reference catalog (12 real SKUs from `productos.csv`), search by vehicle, SKU and manufacturer reference, quotation list, and a designed block for "¿Necesitas un artículo en específico? Escríbenos". **No prices, no stock, no delivery promises** on the site.
- Bot: simulated WhatsApp chat inside the web, powered by Groq with `openai/gpt-oss-120b`, grounded only in `productos.csv` and the company facts above. It must not give prices, promise stock or dates, or grant discounts. It captures name, vehicle/plate, references of interest and data-processing consent, then hands off to an advisor with context. WhatsApp's real API is not used.
- CRM demo: built only from the provided CSVs (clientes, cotizaciones, ventas, interacciones, PQR, campañas, publicaciones, inventario, productos). Advisors appear by code (E02–E05) because the files do not map codes to names. Missing data is shown as "sin dato", never invented.
- Budget context: $38M COP first year, at most one hire, no internal technical staff, no major change between Dec 1–31, adoption training inside work hours.
- Compliance: Colombian personal-data protection law (Ley 1581 de 2012) and current e-invoicing.
- Undecided: WhatsApp business number (use an editable placeholder), real CRM vendor, additional products beyond the 12 SKUs.

## Brand Commitments

- Name: CarSystem (logo provided by the user; navy, teal and orange). No brand manual exists.
- Binding visual constraints volunteered by the user: professional and minimalist, flat colors with no gradients, colors that represent the brand.
- Language: Spanish (Colombia).

## Evidence on Hand

CSV files supplied in the conversation: campanas, clientes, cotizaciones, interacciones, inventario, pqr, productos, publicaciones, ventas (Jul–Sep 2026). A technology and infrastructure diagnosis (TEC-01 to TEC-04, INC-01 to INC-05). Company profile, org chart roles and 2027 goals. Absences not to fabricate: product photos, prices on the site, advisor names for codes E02–E05, testimonials, customer logos, WhatsApp number, street address beyond "Guayabal, Medellín".

## Product Principles

1. Quote first: the site informs and invites a quotation; it never sells at a fixed price.
2. The advisor stays: automation prepares and filters; a human closes and keeps the relationship.
3. Say only what is true: no invented data, products, stock, prices or delivery promises.
4. One record per customer: conversations, quotations, sales and PQR live together.
5. Keep working when something fails: phone, counter and WhatsApp stay available, with a contingency mode.

## Accessibility & Inclusion

Users have basic digital skills; interfaces must be readable and operable without training. Meet WCAG 2.2 AA contrast and keyboard access as a baseline.
