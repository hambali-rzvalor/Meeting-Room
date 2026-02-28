'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['admin', 'employee']).default('employee'),
});

export async function registerUser(input: z.infer<typeof registerSchema>) {
  try {
    const validation = registerSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Invalid input',
      };
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validation.data.email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'Email sudah terdaftar',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validation.data.password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: validation.data.name,
        email: validation.data.email,
        password: hashedPassword,
        role: validation.data.role,
      })
      .returning();

    return {
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error('[registerUser] Error:', error);
    return {
      success: false,
      error: 'Gagal membuat user',
    };
  }
}
