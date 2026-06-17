"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TagBadge } from "./tag-badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tag = {
  id: string;
  name: string;
  color: string;
};

interface EntityTagsPanelProps {
  entityType: "CONTACT" | "ORGANIZATION";
  entityId: string;
}

export function EntityTagsPanel({ entityType, entityId }: EntityTagsPanelProps) {
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [assignedRes, allRes] = await Promise.all([
          api.get(`/tags/assignments/${entityType}/${entityId}`),
          api.get("/tags"), // Only active tags
        ]);

        setAssignedTags(assignedRes.data);
        setAvailableTags(allRes.data);
      } catch (error) {
        console.error("Failed to load tags data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [entityType, entityId]);

  const unassignedTags = availableTags.filter(
    (at) => !assignedTags.some((st) => st.id === at.id)
  );

  const assignTag = async (tag: Tag) => {
    try {
      await api.post("/tags/assignments", {
        tagId: tag.id,
        entityType,
        entityId,
      });
      setAssignedTags([...assignedTags, tag]);
    } catch (e) {
      console.error(e);
      alert("Erro ao vincular tag.");
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      await api.delete(`/tags/assignments/${tagId}/${entityType}/${entityId}`);
      setAssignedTags(assignedTags.filter((t) => t.id !== tagId));
    } catch (e) {
      console.error(e);
      alert("Erro ao desvincular tag.");
    }
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Carregando tags...</div>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {assignedTags.map((tag) => (
        <TagBadge 
          key={tag.id} 
          name={tag.name} 
          color={tag.color} 
          onRemove={() => removeTag(tag.id)} 
        />
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs mb-2">
            <Plus className="mr-1 h-3 w-3" /> Adicionar Tag
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
          {unassignedTags.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">Nenhuma tag disponível</div>
          ) : (
            unassignedTags.map((tag) => (
              <DropdownMenuItem 
                key={tag.id} 
                onClick={() => assignTag(tag)}
                className="cursor-pointer"
              >
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></div>
                {tag.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
