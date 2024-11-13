// src/repositories/refreshTokenRepository.ts

import { ApiError } from '@/lib/errors';
import prisma from '@/lib/prisma';

interface CreateRefreshTokenData {
  userId: string;
  deviceId: string;
  deviceInfo?: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
    async create(data: CreateRefreshTokenData) {
      try {
        return await prisma.refreshToken.create({
          data: {
            token: `rt_${Math.random().toString(36).substr(2)}`,
            deviceId: data.deviceId,
            studentId: data.userId,
            expires: data.expiresAt,
          },
        });
      } catch (e) {
        const error = e as Error;
        console.error('Repository Create Refresh Token Error:', error.message);
        throw new ApiError('CREATE_FAILED', 'Gagal membuat refresh token', 500);
      }
    }

  async findByUserId(userId: string) {
    try {
      return await prisma.refreshToken.findMany({
        where: {
          studentId: userId,
          revokedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error('Repository Find Refresh Tokens Error:', error.message);
      throw new ApiError('FETCH_FAILED', 'Gagal mengambil data refresh token', 500);
    }
  }

  async revokeByDeviceId(userId: string, deviceId: string) {
    try {
      await prisma.refreshToken.updateMany({
        where: {
          studentId: userId,
          deviceId: deviceId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch (e) {
      const error = e as Error;
      console.error('Repository Revoke Refresh Token Error:', error.message);
      throw new ApiError('UPDATE_FAILED', 'Gagal merevoke refresh token', 500);
    }
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();