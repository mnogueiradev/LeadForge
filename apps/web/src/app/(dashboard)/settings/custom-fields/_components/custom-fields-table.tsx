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
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

type CustomField = {
  id: string;
  name: string;
  slug: string;
  fieldType: string;
  isRequired: boolean;
  isUnique: boolean;
  isActive: boolean;
  displayOrder: number;
};

export function CustomFieldsTable({ entityType }: { entityType: "CONTACT" | "ORGANIZATION" }) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get(`/custom-fields?entityType=${entityType}`);
        setFields(response.data);
      } catch (error) {
        console.error("Failed to load fields", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [entityType]);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.patch(`/custom-fields/${id}`, { isActive: !current });
      setFields(fields.map(f => f.id === id ? { ...f, isActive: !current } : f));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteField = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este campo? Todos os dados serão perdidos.")) return;
    try {
      await api.delete(`/custom-fields/${id}`);
      setFields(fields.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
      alert("Não foi possível deletar o campo. Talvez existam dados vinculados.");
    }
  };

  if (isLoading) return <div>Carregando campos...</div>;

  if (fields.length === 0) return <div className="p-4 text-muted-foreground">Nenhum campo personalizado cadastrado.</div>;

  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ordem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Identificador</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Obrigatório</TableHead>
            <TableHead>Único</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.id}>
              <TableCell>{field.displayOrder}</TableCell>
              <TableCell className="font-medium">{field.name}</TableCell>
              <TableCell className="font-mono text-sm">{field.slug}</TableCell>
              <TableCell>
                <Badge variant="outline">{field.fieldType}</Badge>
              </TableCell>
              <TableCell>{field.isRequired ? "Sim" : "Não"}</TableCell>
              <TableCell>{field.isUnique ? "Sim" : "Não"}</TableCell>
              <TableCell>
                <Switch 
                  checked={field.isActive} 
                  onCheckedChange={() => toggleActive(field.id, field.isActive)} 
                />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteField(field.id)}>
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
