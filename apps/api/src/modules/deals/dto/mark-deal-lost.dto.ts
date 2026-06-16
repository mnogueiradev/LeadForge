import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MarkDealLostDto {
  @IsString()
  @IsNotEmpty()
  lostReason: string;

  @IsString()
  @IsOptional()
  lostAt?: string;
}
