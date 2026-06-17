"use client";

import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pin, Trash2, Globe, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type NoteVisibility = 'PRIVATE' | 'TEAM' | 'TENANT';

export interface NoteAuthor {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
}

export interface NoteData {
  id: string;
  content: string;
  isPinned: boolean;
  visibility: NoteVisibility;
  createdAt: string;
  author: NoteAuthor;
}

interface NoteCardProps {
  note: NoteData;
  onTogglePin: (id: string, isPinned: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canDelete: boolean;
  canPin: boolean;
}

const VisibilityIcon = ({ visibility }: { visibility: NoteVisibility }) => {
  switch (visibility) {
    case 'PRIVATE': return <span title="Privado"><Lock className="h-3 w-3 text-red-500" /></span>;
    case 'TEAM': return <span title="Time"><Users className="h-3 w-3 text-blue-500" /></span>;
    case 'TENANT': return <span title="Público"><Globe className="h-3 w-3 text-green-500" /></span>;
  }
};

export function NoteCard({ note, onTogglePin, onDelete, canDelete, canPin }: NoteCardProps) {
  const authorName = `${note.author.firstName} ${note.author.lastName || ''}`.trim();
  const initials = authorName.substring(0, 2).toUpperCase();
  const dateStr = formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR });

  return (
    <div className={cn(
      "p-4 border rounded-md shadow-sm relative group transition-colors",
      note.isPinned ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900" : "bg-card"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={note.author.avatarUrl || ''} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold">{authorName}</span>
              <VisibilityIcon visibility={note.visibility} />
            </div>
            <span className="text-xs text-muted-foreground">{dateStr}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canPin && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onTogglePin(note.id, !note.isPinned)}
              title={note.isPinned ? "Desfixar" : "Fixar no topo"}
            >
              <Pin className={cn("h-4 w-4", note.isPinned ? "fill-amber-500 text-amber-500" : "text-muted-foreground")} />
            </Button>
          )}
          {canDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:text-red-500"
              onClick={() => onDelete(note.id)}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Pinned Badge */}
      {note.isPinned && (
        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center shadow-sm">
          <Pin className="h-3 w-3 mr-1 fill-white" />
          Fixada
        </div>
      )}

      {/* Content */}
      <div className="mt-3 text-sm prose prose-sm dark:prose-invert max-w-none break-words">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </div>
    </div>
  );
}
