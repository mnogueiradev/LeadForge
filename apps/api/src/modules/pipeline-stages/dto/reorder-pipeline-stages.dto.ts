import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderStageItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class ReorderPipelineStagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderStageItemDto)
  stages: ReorderStageItemDto[];
}
