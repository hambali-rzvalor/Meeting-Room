'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function AllBookingsTable({ data }: { data: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter((booking) => {
    const query = searchQuery.toLowerCase();
    return (
      booking.roomName?.toLowerCase().includes(query) ||
      booking.userName?.toLowerCase().includes(query) ||
      booking.userEmail?.toLowerCase().includes(query) ||
      booking.purpose?.toLowerCase().includes(query)
    );
  });

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Semua Booking</CardTitle>
              <CardDescription>
                {data.length} total booking
              </CardDescription>
            </div>
            <SearchInput
              placeholder="Search by room, user, or purpose..."
              onSearch={setSearchQuery}
              className="w-full sm:w-72"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-12">
            <svg className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Semua Booking</CardTitle>
            <CardDescription>
              {data.length} total booking{filteredData.length !== data.length && ` (filtered from ${data.length})`}
            </CardDescription>
          </div>
          <SearchInput
            placeholder="Search by room, user, or purpose..."
            onSearch={setSearchQuery}
            className="w-full sm:w-72"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((booking) => {
                const statusConfig = {
                  pending: { variant: 'pending' as const, label: 'Pending' },
                  confirmed: { variant: 'success' as const, label: 'Dikonfirmasi' },
                  cancelled: { variant: 'destructive' as const, label: 'Dibatalkan' },
                };
                const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

                return (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-sm">{booking.roomName || 'Unknown Room'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{booking.userName || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{booking.userEmail || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm">{format(booking.startTime, 'dd MMM yyyy', { locale: id })}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-muted-foreground max-w-xs truncate">
                        {booking.purpose || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Compact Layout */}
        <div className="md:hidden divide-y">
          {filteredData.map((booking) => {
            const statusConfig = {
              pending: { variant: 'pending' as const, label: 'Pending' },
              confirmed: { variant: 'success' as const, label: 'Dikonfirmasi' },
              cancelled: { variant: 'destructive' as const, label: 'Dibatalkan' },
            };
            const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

            return (
              <div key={booking.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                {/* Header: Room + Status */}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{booking.roomName || 'Unknown Room'}</p>
                  <Badge variant={config.variant} className="text-[10px] h-5 px-2">
                    {config.label}
                  </Badge>
                </div>

                {/* User Info */}
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{booking.userName || 'Unknown'}</p>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-3 mb-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{format(booking.startTime, 'dd MMM', { locale: id })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}</span>
                  </div>
                </div>

                {/* Purpose */}
                {booking.purpose && (
                  <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] text-muted-foreground truncate">
                      <span className="font-medium">Keperluan:</span> {booking.purpose}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
