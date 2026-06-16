import { IsString, IsDateString } from 'class-validator';

export class RescheduleCalendarEventDto {
  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsString()
  timezone: string;
}
