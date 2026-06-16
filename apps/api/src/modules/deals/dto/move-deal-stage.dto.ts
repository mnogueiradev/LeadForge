import { IsString, IsNotEmpty } from 'class-validator';

export class MoveDealStageDto {
  @IsString()
  @IsNotEmpty()
  stageId: string;
}
