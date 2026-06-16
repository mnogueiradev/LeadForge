import { IsString, IsNotEmpty } from 'class-validator';

export class AssignActivityDto {
  @IsString()
  @IsNotEmpty()
  ownerUserId: string;
}
