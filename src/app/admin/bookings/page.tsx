import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { getAllBookings } from '@/actions';
import { PendingBookingsClient } from './PendingBookingsClient';
import { AllBookingsTable } from './AllBookingsTable';

export default function AdminBookingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 pt-2 pb-28 sm:pb-8">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
            Kelola Booking
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Review dan approve request booking
          </p>
        </div>

        <PendingBookingsClient />

        <div className="mt-6">
          <Suspense fallback={<BookingsSkeleton />}>
            <AllBookingsSection />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function AllBookingsSection() {
  const result = await getAllBookings();

  if (!result.success || !result.data) {
    return null;
  }

  return <AllBookingsTable data={result.data} />;
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}
