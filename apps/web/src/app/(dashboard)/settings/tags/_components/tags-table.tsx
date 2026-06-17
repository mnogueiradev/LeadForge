"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { TagBadge } from "@/components/tags/tag-badge";

type Tag = {
  id: string;
  name: string;
  slug: string;
  color: string;
  isActive: boolean;
};

export function TagsTable() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/tags?includeInactive=true");
        setTags(response.data);
      } catch (error) {
        console.error("Failed to load tags", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.patch(`/tags/${id}`, { isActive: !current });
      setTags(tags.map(t => t.id === id ? { ...t, isActive: !current } : t));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm("Tem certeza que deseja arquivar esta tag?")) return;
    try {
      await api.delete(`/tags/${id}`);
      setTags(tags.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
      alert("Não foi possível excluir a tag.");
    }
  };

  if (isLoading) return <div>Carregando tags...</div>;

  if (tags.length === 0) return <div className="p-4 text-muted-foreground">Nenhuma tag cadastrada.</div>;

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Identificador</TableHead>
            <TableHead>Cor (Hex)</TableHead>
            <TableHead>Ativa</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>
                <TagBadge name={tag.name} color={tag.color} />
              </TableCell>
              <TableCell className="font-medium">{tag.name}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">{tag.slug}</TableCell>
              <TableCell className="font-mono text-sm">{tag.color}</TableCell>
              <TableCell>
                <Switch 
                  checked={tag.isActive} 
                  onCheckedChange={() => toggleActive(tag.id, tag.isActive)} 
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteTag(tag.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
