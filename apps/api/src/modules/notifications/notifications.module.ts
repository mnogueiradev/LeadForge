import { Module } from '@nestjs/common';
import { INotificationProvider } from './providers/notification.provider.interface';
import { LogNotificationProvider } from './providers/log-notification.provider';
import { SettingsModule } from '../settings/settings.module';
import { NotificationListener } from './listeners/notification.listener';

@Module({
  imports: [SettingsModule],
  providers: [
    {
      provide: INotificationProvider,
      useClass: LogNotificationProvider,
    },
    NotificationListener,
  ],
  exports: [INotificationProvider],
})
export class NotificationsModule {}
