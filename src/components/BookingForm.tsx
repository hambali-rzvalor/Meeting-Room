'use client';

import { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createBooking, createBookingSchema, type CreateBookingInput } from '@/actions/createBooking';
import { useShake } from '@/hooks/useShake';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  roomId: string;
  userId: string;
}

export function BookingForm({ roomId, userId }: BookingFormProps) {
  const formId = useId();
  const { isShaking, triggerShake } = useShake();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      userId,
      roomId,
      purpose: '',
    },
  });

  const onSubmit = async (data: CreateBookingInput) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);

    try {
      const result = await createBooking(data);
      console.log('Booking result:', result);

      if (result.success) {
        toast.success('Booking berhasil dibuat!', {
          description: 'Booking Anda menunggu konfirmasi admin.',
          duration: 5000,
        });
        reset();
      } else {
        triggerShake();
        toast.error('Gagal membuat booking', {
          description: result.error.message,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      triggerShake();
      toast.error('Terjadi kesalahan', {
        description: 'Silakan coba lagi nanti.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      animate={isShaking ? { x: [-4, 4, -4, 4, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="space-y-5 pb-2"
    >
      {/* Start Time */}
      <div className="space-y-2">
        <Label htmlFor="startTime">Waktu Mulai</Label>
        <Input
          id="startTime"
          type="datetime-local"
          {...register('startTime')}
          disabled={isSubmitting}
          className={cn(errors.startTime && 'border-destructive focus-visible:ring-destructive')}
          required
        />
        {errors.startTime && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.startTime.message}
          </motion.p>
        )}
      </div>

      {/* End Time */}
      <div className="space-y-2">
        <Label htmlFor="endTime">Waktu Selesai</Label>
        <Input
          id="endTime"
          type="datetime-local"
          {...register('endTime')}
          disabled={isSubmitting}
          className={cn(errors.endTime && 'border-destructive focus-visible:ring-destructive')}
          required
        />
        {errors.endTime && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.endTime.message}
          </motion.p>
        )}
      </div>

      {/* Purpose */}
      <div className="space-y-2">
        <Label htmlFor="purpose">Tujuan Meeting</Label>
        <Input
          id="purpose"
          type="text"
          placeholder="Contoh: Weekly Team Sync"
          {...register('purpose')}
          disabled={isSubmitting}
          className={cn(errors.purpose && 'border-destructive focus-visible:ring-destructive')}
          required
        />
        {errors.purpose && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.purpose.message}
          </motion.p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isSubmitting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          'Book Room'
        )}
      </Button>
    </motion.form>
  );
}
