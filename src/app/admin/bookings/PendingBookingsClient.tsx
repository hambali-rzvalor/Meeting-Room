'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/Pagination';
import { getPendingBookings, updateBookingStatus } from '@/actions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 5;

export function PendingBookingsClient() {
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPendingBookings();
  }, [refreshKey]);

  const loadPendingBookings = async () => {
    setIsLoading(true);
    const result = await getPendingBookings();
    if (result.success && result.data) {
      setPendingBookings(result.data);
    }
    setIsLoading(false);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  const totalPages = Math.ceil(pendingBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBookings = pendingBookings.slice(startIndex, endIndex);

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">Booking Pending</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Review dan approve booking yang masuk</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {pendingBookings.length === 0 ? (
          <div className="text-center py-8">
            <svg className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada booking pending</p>
          </div>
        ) : (
          <>
            <div className="divide-y">
              {currentBookings.map((booking, index) => (
                <BookingRow
                  key={booking.id}
                  booking={{ ...booking, userName: booking.userName || 'Unknown', userEmail: booking.userEmail || 'Unknown' }}
                  index={index}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={pendingBookings.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BookingRow({
  booking,
  index,
  onRefresh,
}: {
  booking: {
    id: string;
    roomId: string;
    roomName: string | null;
    userId: string | null;
    userName: string;
    userEmail: string;
    startTime: Date;
    endTime: Date;
    purpose: string | null;
  };
  index: number;
  onRefresh: () => void;
}) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await updateBookingStatus(booking.id, 'confirmed');
      if (result.success) {
        toast.success('Booking berhasil diapprove!', {
          description: `${booking.roomName} telah dikonfirmasi`,
          duration: 3000,
        });
        onRefresh();
      } else {
        toast.error('Gagal approve booking', {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        description: 'Silakan coba lagi',
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const result = await updateBookingStatus(booking.id, 'cancelled');
      if (result.success) {
        toast.success('Booking ditolak', {
          description: `${booking.roomName} telah dibatalkan`,
          duration: 3000,
        });
        onRefresh();
      } else {
        toast.error('Gagal menolak booking', {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error('Terjadi kesalahan', {
        description: 'Silakan coba lagi',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-medium">{booking.roomName}</p>
            <Badge variant="pending" className="text-xs">Pending</Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {booking.userName}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {booking.userEmail}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              {format(booking.startTime, 'dd MMMM yyyy HH:mm', { locale: id })} -{' '}
              {format(booking.endTime, 'HH:mm', { locale: id })}
            </span>
          </div>
          {booking.purpose && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Keperluan:</span> {booking.purpose}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            size="sm"
            className="gap-1 bg-green-600 hover:bg-green-700"
          >
            {isApproving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </>
            )}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isApproving || isRejecting}
            size="sm"
            variant="destructive"
            className="gap-1"
          >
            {isRejecting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="divide-y">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4">
          <div className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
