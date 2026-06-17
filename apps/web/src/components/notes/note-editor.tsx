"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface NoteEditorProps {
  onSave: (content: string, visibility: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function NoteEditor({ onSave, isSubmitting = false }: NoteEditorProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("TENANT");

  const handleSave = async () => {
    if (!content.trim()) return;
    await onSave(content, visibility);
    setContent("");
    setVisibility("TENANT");
  };

  return (
    <div className="border rounded-md p-4 bg-card shadow-sm space-y-4">
      <Textarea
        placeholder="Adicione uma nota... (suporta Markdown)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px] resize-y"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Visibilidade:</span>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TENANT">Toda a Empresa</SelectItem>
              <SelectItem value="TEAM">Meu Time</SelectItem>
              <SelectItem value="PRIVATE">Apenas Eu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          size="sm" 
          onClick={handleSave} 
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Nota
        </Button>
      </div>
    </div>
  );
}
