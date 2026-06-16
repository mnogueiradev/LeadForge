import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class MarkDealWonDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  value?: number;

  @IsString()
  @IsOptional()
  wonAt?: string;
}
