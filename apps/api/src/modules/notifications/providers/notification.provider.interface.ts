export interface INotificationProvider {
  sendInvitationEmail(
    to: string,
    inviteUrl: string,
    inviterName: string,
    companyName: string,
  ): Promise<void>;

  sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    context?: any,
  ): Promise<void>;
}

export const INotificationProvider = Symbol('INotificationProvider');
