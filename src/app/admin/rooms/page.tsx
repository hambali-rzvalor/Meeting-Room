'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { createRoom, updateRoom, deleteRoom, getRooms } from '@/actions';
import type { Room } from '@/db/schema';

interface RoomFormData {
  name: string;
  capacity: string;
  location: string;
  imageUrl: string;
  isActive: boolean;
}

// Sample image URLs for meeting rooms (free from Unsplash)
const SAMPLE_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
  'https://images.unsplash.com/photo-1517502884422-41e157d4430c?w=800',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
  'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800',
  'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800',
];

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    capacity: '',
    location: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    const result = await getRooms();
    if (result.success && result.data) {
      setRooms(result.data);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      location: '',
      imageUrl: '',
      isActive: true,
    });
    setEditingRoom(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity.toString(),
      location: room.location || '',
      imageUrl: room.imageUrl || '',
      isActive: room.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      capacity: parseInt(formData.capacity, 10),
    };

    try {
      let result;
      if (editingRoom) {
        result = await updateRoom(editingRoom.id, data);
      } else {
        result = await createRoom(data);
      }

      if (result.success && result.data) {
        toast.success(editingRoom ? 'Room updated!' : 'Room created!');
        setIsDialogOpen(false);
        resetForm();
        loadRooms();
      } else {
        toast.error('Failed', { description: result.error });
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const result = await deleteRoom(roomId);
      if (result.success) {
        toast.success('Room deleted!');
        loadRooms();
      } else {
        toast.error('Failed to delete', { description: result.error });
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const selectSampleImage = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <main className="container mx-auto px-4 pt-2 pb-24 sm:pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Manage Rooms
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Add, edit, or delete meeting rooms
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2 w-full sm:w-auto">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Room
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            title="No rooms yet"
            description="Create your first meeting room to get started."
            action={
              <Button onClick={openCreateDialog} className="gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Room
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{room.name}</CardTitle>
                      <Badge variant={room.isActive ? 'success' : 'secondary'}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Capacity: {room.capacity} people
                    </div>
                    {room.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {room.location}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(room)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(room.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <Dialog
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              resetForm();
            }}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isEditing={!!editingRoom}
            selectSampleImage={selectSampleImage}
            sampleImages={SAMPLE_ROOM_IMAGES}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Dialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
  selectSampleImage,
  sampleImages,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: RoomFormData;
  setFormData: (data: RoomFormData) => void;
  isEditing: boolean;
  selectSampleImage: (url: string) => void;
  sampleImages: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {isEditing ? 'Edit Room' : 'Create Room'}
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Floor 1, Building A"
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="Paste image URL or select from samples below"
              />
            </div>
            
            {/* Sample Images */}
            <div>
              <Label className="mb-2 block">Or select a sample image:</Label>
              <div className="grid grid-cols-4 gap-2">
                {sampleImages.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => selectSampleImage(url)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      formData.imageUrl === url
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={url}
                      alt="Sample room"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
