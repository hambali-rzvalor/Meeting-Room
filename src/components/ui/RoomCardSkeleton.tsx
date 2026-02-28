'use client';

import { motion } from 'framer-motion';

export function RoomCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800"
    >
      {/* Image Skeleton */}
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          animate={{
            backgroundPosition: ['-200% 0', '200% 0'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"
        />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Capacity Badge */}
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

        {/* Button */}
        <div className="h-11 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    </motion.div>
  );
}

export function RoomsListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}
