import { IsArray, ValidateNested, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PipelineOrderDto {
  @IsString()
  id: string;

  @IsInt()
  displayOrder: number;
}

export class ReorderPipelinesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PipelineOrderDto)
  pipelines: PipelineOrderDto[];
}
