import { Suspense } from 'react';
import Link from 'next/link';
import { getRooms } from '@/actions';
import { Navigation } from '@/components/Navigation';
import { RoomsList } from '@/components/RoomsList';
import { RoomsListSkeleton } from '@/components/ui/RoomCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Room } from '@/db/schema';

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 pt-2 pb-32 sm:pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Book a Meeting Room
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Choose the perfect space for your next meeting
          </p>
        </div>

        {/* Rooms Grid */}
        <Suspense fallback={<RoomsListSkeleton />}>
          <RoomsContent />
        </Suspense>
      </main>
    </div>
  );
}

async function RoomsContent() {
  const result = await getRooms();

  if (!result.success || !result.data) {
    return (
      <EmptyState
        title="Gagal memuat ruangan"
        description="Silakan refresh halaman atau coba lagi nanti."
      />
    );
  }

  const activeRooms = result.data.filter((room: Room) => room.isActive);

  if (activeRooms.length === 0) {
    return (
      <EmptyState
        title="Belum ada ruangan"
        description="Ruangan meeting akan segera tersedia."
        action={
          <Link href="/admin" className="inline-flex items-center gap-2 text-primary hover:underline">
            Kelola Ruangan
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        }
      />
    );
  }

  return <RoomsList rooms={activeRooms} />;
}
