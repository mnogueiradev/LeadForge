import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { EntityType, NoteVisibility } from '@prisma/client';

export class CreateNoteDto {
  @IsEnum(EntityType)
  entityType: EntityType;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(NoteVisibility)
  @IsOptional()
  visibility?: NoteVisibility;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(NoteVisibility)
  @IsOptional()
  visibility?: NoteVisibility;
}

export class TogglePinNoteDto {
  @IsBoolean()
  isPinned: boolean;
}
