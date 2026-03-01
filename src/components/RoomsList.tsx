'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RoomCard } from './RoomCard';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import type { Room } from '@/db/schema';

interface RoomsListProps {
  rooms: Room[];
}

const ITEMS_PER_PAGE = 6;

export function RoomsList({ rooms }: RoomsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  if (rooms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </motion.div>
        <h3 className="mt-6 text-xl font-semibold text-gray-700 dark:text-gray-300">
          No rooms available
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Check back later for available meeting rooms
        </p>
      </motion.div>
    );
  }

  // Filter rooms based on search query
  const filteredRooms = rooms.filter((room) => {
    const query = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(query) ||
      room.location?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search rooms by name or location..."
          onSearch={setSearchQuery}
          className="w-full sm:max-w-md"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-8">
        {currentRooms.map((room, index) => (
          <RoomCard key={room.id} room={room} index={index} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredRooms.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      {filteredRooms.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <svg className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No rooms found matching "{searchQuery}"</p>
        </div>
      )}
    </>
  );
}
