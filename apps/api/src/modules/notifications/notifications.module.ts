import { Module } from '@nestjs/common';
import { INotificationProvider } from './providers/notification.provider.interface';
import { LogNotificationProvider } from './providers/log-notification.provider';

@Module({
  providers: [
    {
      provide: INotificationProvider,
      useClass: LogNotificationProvider,
    },
  ],
  exports: [INotificationProvider],
})
export class NotificationsModule {}
