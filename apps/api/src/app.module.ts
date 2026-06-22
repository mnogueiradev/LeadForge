import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { AppController } from './app.controller';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { AppService } from './app.service';
import { validateEnv } from './config/env.config';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { UsersModule } from './modules/users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { AuditModule } from './modules/audit/audit.module';
import { SecurityLogsModule } from './modules/security-logs/security-logs.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SecurityPoliciesModule } from './modules/security-policies/security-policies.module';
import { IdentityHardeningModule } from './modules/identity-hardening/identity-hardening.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { TagsModule } from './modules/tags/tags.module';
import { NotesModule } from './modules/notes/notes.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { PipelineStagesModule } from './modules/pipeline-stages/pipeline-stages.module';
import { DealsModule } from './modules/deals/deals.module';
import { PipelineMovementsModule } from './modules/pipeline-movements/pipeline-movements.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ClsModule } from 'nestjs-cls';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req: ExpressRequest) => {
          const xRequestId = req.headers['x-request-id'];
          cls.set(
            'requestId',
            typeof xRequestId === 'string' ? xRequestId : uuidv4(),
          );
          cls.set(
            'ipAddress',
            req.ip ||
              (typeof req.connection?.remoteAddress === 'string'
                ? req.connection.remoteAddress
                : undefined),
          );
          cls.set('userAgent', req.headers['user-agent']);
          // tenantId and userId might be set by AuthGuard later in the request lifecycle
        },
      },
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,
            limit: 5,
          },
          {
            name: 'medium',
            ttl: 10000,
            limit: 20,
          },
          {
            name: 'default',
            ttl: 60000,
            limit: 100, // 100 reqs por min Global
          },
        ],
        storage: new ThrottlerStorageRedisService(
          `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        ),
      }),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    RbacModule,
    NotificationsModule,
    InvitationsModule,
    AuditModule,
    SecurityLogsModule,
    SessionsModule,
    SecurityPoliciesModule,
    IdentityHardeningModule,
    OrganizationsModule,
    ContactsModule,
    CustomFieldsModule,
    TagsModule,
    NotesModule,
    TimelineModule,
    LeadsModule,
    PipelinesModule,
    PipelineStagesModule,
    DealsModule,
    PipelineMovementsModule,
    ActivitiesModule,
    CalendarModule,
    AttachmentsModule,
    AnalyticsModule,
    AutomationsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
