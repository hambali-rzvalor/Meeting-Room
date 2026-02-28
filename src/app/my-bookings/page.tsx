import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getBookingsByUser } from '@/actions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function MyBookingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Saya
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lihat dan kelola booking ruangan meeting Anda
          </p>
        </div>

        <Suspense fallback={<BookingsSkeleton />}>
          <BookingsContent userId={session.user.id} />
        </Suspense>
      </main>
    </div>
  );
}

async function BookingsContent({ userId }: { userId: string }) {
  const result = await getBookingsByUser(userId);

  if (!result.success || !result.data) {
    return (
      <EmptyState
        title="Gagal memuat booking"
        description="Silakan refresh halaman atau coba lagi nanti."
      />
    );
  }

  if (result.data.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            className="h-24 w-24 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
        title="Belum ada booking"
        description="Anda belum memiliki booking meeting room."
        action={
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Book Room
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {result.data.map((booking: {
        id: string;
        roomId: string;
        roomName: string | null;
        startTime: Date;
        endTime: Date;
        purpose: string | null;
        status: string;
      }, index: number) => (
        <BookingCard key={booking.id} booking={booking} index={index} />
      ))}
    </div>
  );
}

function BookingCard({
  booking,
  index,
}: {
  booking: {
    id: string;
    roomId: string;
    roomName: string | null;
    startTime: Date;
    endTime: Date;
    purpose: string | null;
    status: string;
  };
  index: number;
}) {
  const statusConfig = {
    pending: { variant: 'pending' as const, label: 'Pending' },
    confirmed: { variant: 'success' as const, label: 'Dikonfirmasi' },
    cancelled: { variant: 'destructive' as const, label: 'Dibatalkan' },
  };

  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.roomName || 'Ruangan Tidak Dikenal'}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {format(booking.startTime, 'dd MMMM yyyy', { locale: id })}
            </CardDescription>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {booking.purpose && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Keperluan</p>
            <p className="text-sm">{booking.purpose}</p>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {format(booking.startTime, 'HH:mm', { locale: id })}
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            {format(booking.endTime, 'HH:mm', { locale: id })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
