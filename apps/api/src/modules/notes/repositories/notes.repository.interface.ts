import { Note, EntityType, NoteVisibility } from '@prisma/client';

export interface CreateNoteData {
  entityType: EntityType;
  entityId: string;
  title?: string;
  content: string;
  visibility?: NoteVisibility;
  isPinned?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  visibility?: NoteVisibility;
}

export const INoteRepository = Symbol('INoteRepository');

export interface INoteRepository {
  create(
    tenantId: string,
    authorId: string,
    data: CreateNoteData,
  ): Promise<Note>;
  update(tenantId: string, id: string, data: UpdateNoteData): Promise<Note>;
  delete(tenantId: string, id: string): Promise<void>;
  findById(tenantId: string, id: string): Promise<Note | null>;
  findByEntity(
    tenantId: string,
    entityType: EntityType,
    entityId: string,
  ): Promise<Note[]>;
  togglePin(tenantId: string, id: string, isPinned: boolean): Promise<Note>;
}
