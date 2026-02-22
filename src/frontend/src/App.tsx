import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useFinanceQueries';
import { LoginButton } from './components/LoginButton';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { FinanceEntryForm } from './components/FinanceEntryForm';
import { ComparisonChart } from './components/ComparisonChart';
import { FinanceDashboard } from './components/FinanceDashboard';
import { Toaster } from './components/ui/sonner';
import { Wallet } from 'lucide-react';

const queryClient = new QueryClient();

function AppContent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const [timePeriod, setTimePeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Finance Tracker</h1>
                <p className="text-sm text-muted-foreground">Manage your finances with ease</p>
              </div>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="p-6 rounded-full bg-primary/10 mb-6">
              <Wallet className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Finance Tracker</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Track your income, expenses, and savings all in one place. Login to get started.
            </p>
            <LoginButton />
          </div>
        ) : (
          <div className="space-y-8">
            <FinanceEntryForm />
            <ComparisonChart timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
            <FinanceDashboard timePeriod={timePeriod} onTimePeriodChange={setTimePeriod} />
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Finance Tracker. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
