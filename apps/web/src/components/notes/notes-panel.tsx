"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NoteEditor } from "./note-editor";
import { NoteCard, NoteData } from "./note-card";
import { useAuthStore } from "@/store/auth.store";

interface NotesPanelProps {
  entityType: "CONTACT" | "ORGANIZATION";
  entityId: string;
}

export function NotesPanel({ entityType, entityId }: NotesPanelProps) {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotes = async () => {
    try {
      const response = await api.get(`/notes/entity/${entityType}/${entityId}`);
      setNotes(response.data);
    } catch (error) {
      console.error("Failed to load notes", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  const handleCreateNote = async (content: string, visibility: string) => {
    setIsSubmitting(true);
    try {
      await api.post("/notes", {
        entityType,
        entityId,
        content,
        visibility,
      });
      await loadNotes(); // Reload to get the created note with author details properly formatted
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar nota.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      await api.patch(`/notes/${id}/pin`, { isPinned });
      // Optmistic UI update or reload
      setNotes(notes.map(n => n.id === id ? { ...n, isPinned } : n).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta nota permanentemente?")) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir nota.");
    }
  };

  return (
    <div className="space-y-6">
      <NoteEditor onSave={handleCreateNote} isSubmitting={isSubmitting} />
      
      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground py-8">Carregando notas...</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">Nenhuma nota registrada ainda.</div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onTogglePin={handleTogglePin}
              onDelete={handleDelete}
              canDelete={note.author.id === user?.id /* or has specific permission */}
              canPin={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
