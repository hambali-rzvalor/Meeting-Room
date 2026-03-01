'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Room } from '@/db/schema';

interface RoomCardProps {
  room: Room;
  index?: number;
}

export function RoomCard({ room, index = 0 }: RoomCardProps) {
  const router = useRouter();

  const handleBookNow = () => {
    router.push(`/rooms/${room.id}/book`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-gray-800 mb-6 sm:mb-0"
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        {room.imageUrl ? (
          <motion.img
            src={room.imageUrl}
            alt={room.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <svg
              className="h-16 w-16 text-white/50"
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
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
              room.isActive
                ? 'bg-green-500/90 text-white'
                : 'bg-gray-500/90 text-white'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                room.isActive ? 'bg-white' : 'bg-gray-300'
              }`}
            />
            {room.isActive ? 'Available' : 'Unavailable'}
          </motion.div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {room.name}
            </h3>
            {room.location && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {room.location}
              </motion.p>
            )}
          </div>
        </div>

        {/* Capacity Badge */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 dark:bg-blue-900/30">
            <svg
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Up to {room.capacity} people
            </span>
          </div>
        </div>

        {/* Book Now Button */}
        <motion.button
          onClick={handleBookNow}
          disabled={!room.isActive}
          whileHover={room.isActive ? { scale: 1.02 } : {}}
          whileTap={room.isActive ? { scale: 0.98 } : {}}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
            room.isActive
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
          }`}
        >
          {room.isActive ? (
            <span className="flex items-center justify-center gap-2">
              Book Now
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
            </span>
          ) : (
            'Currently Unavailable'
          )}
        </motion.button>
      </div>

      {/* Decorative Corner Accent */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl" />
    </motion.div>
  );
}
