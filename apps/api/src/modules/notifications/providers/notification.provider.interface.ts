export interface INotificationProvider {
  sendInvitationEmail(
    to: string,
    inviteUrl: string,
    inviterName: string,
    companyName: string,
  ): Promise<void>;
}

export const INotificationProvider = Symbol('INotificationProvider');
