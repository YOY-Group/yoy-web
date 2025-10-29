// apps/web/app/(shop)/layout.tsx
import AccountDrawer from './components/AccountDrawer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 border-b">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          {/* Left: logo / nav */}

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-3">
            {/* …other actions (cart, etc.) */}
            <AccountDrawer />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}