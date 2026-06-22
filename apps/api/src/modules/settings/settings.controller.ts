import { Controller, Get, Post, Body, Put, Param, Delete, Req, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { QuerySettingsDto } from './dto/query-settings.dto';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { SETTINGS_PERMISSIONS } from './settings.constants';
import { SettingEntity } from './entities/setting.entity';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermissions(SETTINGS_PERMISSIONS.READ)
  async findAll(@Req() req: any, @Query() query: QuerySettingsDto) {
    const tenantId = req.user.tenantId;
    const settings = await this.settingsService.findAll(tenantId, query);
    return settings.map((s) => new SettingEntity(s));
  }

  @Get(':key')
  @RequirePermissions(SETTINGS_PERMISSIONS.READ)
  async findOne(@Req() req: any, @Param('key') key: string) {
    const tenantId = req.user.tenantId;
    const setting = await this.settingsService.findOne(tenantId, key);
    return new SettingEntity(setting);
  }

  @Post()
  @RequirePermissions(SETTINGS_PERMISSIONS.WRITE)
  async create(@Req() req: any, @Body() createSettingDto: CreateSettingDto) {
    const tenantId = req.user.tenantId;
    // We can also use upsert for creation directly to avoid unique constraint errors if preferred, 
    // but POST usually expects creation. We will use upsert internally so it behaves defensively.
    const setting = await this.settingsService.upsert(tenantId, createSettingDto.key, createSettingDto.value);
    return new SettingEntity(setting);
  }

  @Put(':key')
  @RequirePermissions(SETTINGS_PERMISSIONS.WRITE)
  async update(
    @Req() req: any, 
    @Param('key') key: string, 
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    const tenantId = req.user.tenantId;
    const setting = await this.settingsService.upsert(tenantId, key, updateSettingDto.value);
    return new SettingEntity(setting);
  }

  @Delete(':key')
  @RequirePermissions(SETTINGS_PERMISSIONS.DELETE)
  async remove(@Req() req: any, @Param('key') key: string) {
    const tenantId = req.user.tenantId;
    const setting = await this.settingsService.remove(tenantId, key);
    return new SettingEntity(setting);
  }
}
