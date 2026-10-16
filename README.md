# 👟 MY Shoes

An online shoe store built for the Algerian market, with cash-on-delivery checkout and a full admin dashboard to manage products, orders, discounts and delivery prices.

**Live demo:** https://my-shoes-psi.vercel.app

## Features

### Storefront
- Browse products by category, with sizes, colors and image galleries
- Product detail pages with variant selection (size and color)
- Shopping cart
- Checkout with Algerian address fields (wilaya, commune) and a choice of delivery method
- Cash on Delivery payment
- Order confirmation page

### Admin dashboard (`/admin`)
- Secure admin login (role-based access)
- Dashboard overview
- Product management: create, edit and delete products, upload images
- Order management: view orders and update their status
- Discount management
- Delivery price settings
- Account settings (change password)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui (Radix UI) |
| Routing | React Router |
| Data fetching | TanStack Query |
| Forms and validation | React Hook Form, Zod |
| Backend | Supabase (PostgreSQL, Auth, Storage, Row Level Security) |
| Hosting | Vercel |

## Project Structure

```
MY-Shoes/
├── public/                  # Static files
├── src/
│   ├── components/          # Shared components (Header, Footer, ProductCard, ...)
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/            # AuthContext, CartContext
│   ├── hooks/               # Custom hooks
│   ├── integrations/
│   │   └── supabase/        # Supabase client and generated types
│   ├── pages/               # Storefront and admin pages
│   ├── App.tsx              # Routes
│   └── main.tsx             # Entry point
├── supabase/
│   ├── config.toml
│   └── migrations/          # Database schema and RLS policies
├── vercel.json              # SPA rewrites
└── vite.config.ts
```

## Getting Started

### Prerequisites
- Node.js 18 or newer
- npm
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/chaima-m/MY-Shoes.git
cd MY-Shoes
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (it is git-ignored):

```env
VITE_SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR-SUPABASE-ANON-KEY"
```

You can find both values in your Supabase dashboard under **Project Settings → API**.

> ⚠️ Only use the **anon / publishable** key in this project. Never put the `service_role` key in the frontend or commit it to Git.

### 3. Set up the database

Apply the migrations in `supabase/migrations/` to your Supabase project, either with the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```

or by pasting the SQL files into the Supabase SQL editor.

### 4. Create your first admin

1. In Supabase, go to **Authentication → Users** and create a user.
2. In the SQL editor, give that user the admin role:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER-UUID-HERE', 'admin');
```

3. Log in at `/admin`.

### 5. Run the app

```bash
npm run dev
```

The app runs at http://localhost:8080.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Deployment

The project is deployed on Vercel. To deploy your own copy:

1. Import the repository in Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables.
3. Deploy. `vercel.json` already handles client-side routing.

## Security Notes

- Access control is enforced by **Supabase Row Level Security**, not by the frontend. Hiding a page in React is not security.
- Only admins (rows in `user_roles` with role `admin`) can modify products, orders and product images.
- Never commit `.env` files or any `service_role` key.

## Roadmap

- Online payment options
- Order tracking for customers
- Email or SMS order notifications
- Multi-language support (French / Arabic / English)

## License

This project is private and all rights are reserved. Contact the author for permission to use it.

## Author

Made by [chaima-m](https://github.com/chaima-m)
