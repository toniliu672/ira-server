// src/repositories/adminRepository.ts

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { ApiError } from '@/lib/errors';
import type { AdminFilters } from '@/types/admin';

export class AdminRepository {
  async findById(id: string) {
    try {
      return await prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          password: true, 
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error('Repository Find Admin By ID Error:', error.message);
      throw new ApiError('FETCH_FAILED', 'Gagal mengambil data admin', 500);
    }
  }

  async findMany(filters: AdminFilters) {
    const { 
      search = '', 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = filters;

    try {
      const where: Prisma.AdminWhereInput = search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [admins, total] = await prisma.$transaction([
        prisma.admin.findMany({
          where,
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.admin.count({ where })
      ]);

      return { admins, total };
    } catch (e) {
      const error = e as Error;
      console.error('Repository Find Many Admins Error:', error.message);
      throw new ApiError('FETCH_FAILED', 'Gagal mengambil data admin', 500);
    }
  }

  async findByUsernameWithPassword(username: string) {
    try {
      return await prisma.admin.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error('Repository Find Admin By Username Error:', error.message);
      throw new ApiError('FETCH_FAILED', 'Gagal mengambil data admin', 500);
    }
  }

  async create(data: Prisma.AdminCreateInput) {
    try {
      return await prisma.admin.create({
        data,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error('Repository Create Admin Error:', error.message);
      
      if (error.message.includes('Unique constraint')) {
        throw new ApiError('DUPLICATE_ENTRY', 'Username atau email sudah digunakan', 409);
      }
      
      throw new ApiError('CREATE_FAILED', 'Gagal membuat admin baru', 500);
    }
  }

  async update(id: string, data: Prisma.AdminUpdateInput) {
    try {
      return await prisma.admin.update({
        where: { id },
        data,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error('Repository Update Admin Error:', error.message);
      
      if (error.message.includes('Record to update not found')) {
        throw new ApiError('NOT_FOUND', 'Admin tidak ditemukan', 404);
      }
      
      if (error.message.includes('Unique constraint')) {
        throw new ApiError('DUPLICATE_ENTRY', 'Username atau email sudah digunakan', 409);
      }
      
      throw new ApiError('UPDATE_FAILED', 'Gagal mengupdate admin', 500);
    }
  }

  async delete(id: string) {
    try {
      await prisma.admin.delete({
        where: { id }
      });
    } catch (e) {
      const error = e as Error;
      console.error('Repository Delete Admin Error:', error.message);
      
      if (error.message.includes('Record to delete does not exist')) {
        throw new ApiError('NOT_FOUND', 'Admin tidak ditemukan', 404);
      }
      
      throw new ApiError('DELETE_FAILED', 'Gagal menghapus admin', 500);
    }
  }
}

// Singleton instance
export const adminRepository = new AdminRepository();