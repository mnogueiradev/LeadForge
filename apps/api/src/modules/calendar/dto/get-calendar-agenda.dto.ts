import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GetCalendarAgendaDto {
  @IsDateString()
  rangeStart: string;

  @IsDateString()
  rangeEnd: string;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}
