import { IsString, IsNotEmpty } from 'class-validator';

export class AssignDealOwnerDto {
  @IsString()
  @IsNotEmpty()
  ownerUserId: string;
}
