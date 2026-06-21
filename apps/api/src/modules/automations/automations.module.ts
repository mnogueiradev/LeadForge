import { Module } from '@nestjs/common';
import { DealMovedListener } from './listeners/deal-moved.listener';
import { StagnantDealsCron } from './cron/stagnant-deals.cron';

@Module({
  providers: [DealMovedListener, StagnantDealsCron],
})
export class AutomationsModule {}
