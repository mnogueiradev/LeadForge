import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { QuerySettingsDto } from './dto/query-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(tenantId: string, query: QuerySettingsDto) {
    const { search } = query;
    return this.prisma.setting.findMany({
      where: {
        tenantId,
        ...(search ? { key: { contains: search, mode: 'insensitive' } } : {}),
      },
    });
  }

  async findOne(tenantId: string, key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key "${key}" not found.`);
    }

    return setting;
  }

  async create(tenantId: string, createDto: CreateSettingDto) {
    return this.prisma.setting.create({
      data: {
        tenantId,
        key: createDto.key,
        valueJson: createDto.value,
      },
    });
  }

  async upsert(tenantId: string, key: string, value: any) {
    return this.prisma.setting.upsert({
      where: { tenantId_key: { tenantId, key } },
      update: { valueJson: value },
      create: { tenantId, key, valueJson: value },
    });
  }

  async remove(tenantId: string, key: string) {
    try {
      return await this.prisma.setting.delete({
        where: { tenantId_key: { tenantId, key } },
      });
    } catch (error) {
      // Prisma throws code P2025 if record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`Setting with key "${key}" not found.`);
      }
      throw error;
    }
  }
}
