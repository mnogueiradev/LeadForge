import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SettingsService } from '../../settings/settings.service';
import { INotificationProvider } from '../providers/notification.provider.interface';
import { Deal } from '@prisma/client';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly settingsService: SettingsService,
    @Inject(INotificationProvider)
    private readonly notificationProvider: INotificationProvider,
  ) {}

  @OnEvent('deal.created')
  async handleDealCreated(payload: { deal: Deal; userId: string }) {
    await this.processNewLeadNotification(payload.deal, 'Novo lead criado');
  }

  @OnEvent('deal.owner.changed')
  async handleDealOwnerChanged(payload: { deal: Deal; newOwnerId: string }) {
    await this.processNewLeadNotification(payload.deal, 'Lead reatribuído a você');
  }

  @OnEvent('deal.won')
  async handleDealWon(payload: { deal: Deal; userId: string }) {
    const { deal } = payload;

    // Check setting "notify_won_deals"
    const notifyWonDeals = await this.settingsService.findOne(deal.tenantId, 'notify_won_deals');
    // Consider true if the value is missing as a default behavior, but usually we respect the DB
    // Since UI uses boolean or 'true' strings, we check both. Default true to match UI if undefined
    const isEnabled = notifyWonDeals ? (notifyWonDeals.value === 'true' || notifyWonDeals.value === true) : true;

    if (!isEnabled) {
      this.logger.debug(`Notification skipped for Deal Won (Deal ID: ${deal.id}) - Disabled in Settings`);
      return;
    }

    const ownerId = deal.ownerUserId;
    if (!ownerId) return;

    await this.notificationProvider.sendSystemNotification(
      ownerId,
      '🎉 Negócio Ganho!',
      `O negócio "${deal.title}" foi marcado como Ganho.`,
      { dealId: deal.id, value: deal.value },
    );
  }

  @OnEvent('deal.lost')
  async handleDealLost(payload: { deal: Deal; userId: string }) {
    const { deal } = payload;

    // Check setting "notify_lost_deals"
    const notifyLostDeals = await this.settingsService.findOne(deal.tenantId, 'notify_lost_deals');
    const isEnabled = notifyLostDeals ? (notifyLostDeals.value === 'true' || notifyLostDeals.value === true) : false; // Lost deals default is false in UI

    if (!isEnabled) {
      this.logger.debug(`Notification skipped for Deal Lost (Deal ID: ${deal.id}) - Disabled in Settings`);
      return;
    }

    const ownerId = deal.ownerUserId;
    if (!ownerId) return;

    await this.notificationProvider.sendSystemNotification(
      ownerId,
      '❌ Negócio Perdido',
      `O negócio "${deal.title}" foi marcado como Perdido.`,
      { dealId: deal.id, value: deal.value },
    );
  }

  private async processNewLeadNotification(deal: Deal, title: string) {
    const ownerId = deal.ownerUserId;
    if (!ownerId) return;

    const notifyNewLeads = await this.settingsService.findOne(deal.tenantId, 'notify_new_leads');
    const isEnabled = notifyNewLeads ? (notifyNewLeads.value === 'true' || notifyNewLeads.value === true) : true;

    if (!isEnabled) {
      this.logger.debug(`Notification skipped for New Lead (Deal ID: ${deal.id}) - Disabled in Settings`);
      return;
    }

    await this.notificationProvider.sendSystemNotification(
      ownerId,
      title,
      `O lead "${deal.title}" foi atribuído a você.`,
      { dealId: deal.id },
    );
  }
}
