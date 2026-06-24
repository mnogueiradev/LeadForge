import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider } from './notification.provider.interface';

@Injectable()
export class LogNotificationProvider implements INotificationProvider {
  private readonly logger = new Logger(LogNotificationProvider.name);

  async sendInvitationEmail(
    to: string,
    inviteUrl: string,
    inviterName: string,
    companyName: string,
  ): Promise<void> {
    this.logger.log(`\n
      ======================================================
      [MOCK EMAIL] Convite de Acesso
      ======================================================
      Para: ${to}
      De: ${inviterName} via ${companyName}
      
      Você foi convidado(a) para participar da equipe de ${companyName} no LeadForge.
      
      Clique no link abaixo para aceitar o convite e criar sua conta:
      ${inviteUrl}
      
      Este link expira em 7 dias.
      ======================================================
    `);
  }

  async sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    context?: any,
  ): Promise<void> {
    this.logger.log(`\n
      🔔 [SYSTEM NOTIFICATION]
      ======================================================
      User ID: ${userId}
      Title:   ${title}
      Message: ${message}
      Context: ${context ? JSON.stringify(context) : 'None'}
      ======================================================
    `);
  }
}
