import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPendingBookings, updateBookingStatus } from '@/actions';
import { format } from 'date-fns';

export default async function AdminPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage rooms and approve bookings
          </p>
        </div>

        {/* Admin Menu Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <AdminMenuCard
            title="Manage Rooms"
            description="Add, edit, or delete meeting rooms"
            href="/admin/rooms"
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
          />
          <AdminMenuCard
            title="Approve Bookings"
            description="Review and approve pending booking requests"
            href="/admin/bookings"
            icon={
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            }
          />
        </div>

        {/* Pending Bookings Preview */}
        <Suspense fallback={<PendingBookingsSkeleton />}>
          <PendingBookingsPreview />
        </Suspense>
      </main>
    </div>
  );
}

function AdminMenuCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="h-full cursor-pointer hover:shadow-xl transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">{icon}</div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

async function PendingBookingsPreview() {
  const result = await getPendingBookings();

  if (!result.success || !result.data) {
    return null;
  }

  const pendingBookings = result.data.slice(0, 3);

  if (pendingBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Bookings</CardTitle>
          <CardDescription>No pending bookings to review</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Bookings</CardTitle>
            <CardDescription>
              {result.data.length} booking{result.data.length !== 1 ? 's' : ''} awaiting approval
            </CardDescription>
          </div>
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm">
              View All
              <svg
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingBookings.map((booking: {
            id: string;
            roomId: string;
            roomName: string | null;
            userId: string | null;
            userName: string | null;
            userEmail: string | null;
            startTime: Date;
            endTime: Date;
            purpose: string | null;
          }) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div>
                <p className="font-medium">{booking.roomName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(booking.startTime, 'MMM dd, yyyy HH:mm')} -{' '}
                  {format(booking.endTime, 'HH:mm')}
                </p>
                {booking.purpose && (
                  <p className="text-sm text-muted-foreground mt-1">{booking.purpose}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <form action={async () => {
                  'use server';
                  await updateBookingStatus(booking.id, 'confirmed');
                }}>
                  <Button type="submit" size="sm" variant="default">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </Button>
                </form>
                <form action={async () => {
                  'use server';
                  await updateBookingStatus(booking.id, 'cancelled');
                }}>
                  <Button type="submit" size="sm" variant="destructive">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PendingBookingsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-60 bg-gray-200 dark:bg-gray-700 rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
