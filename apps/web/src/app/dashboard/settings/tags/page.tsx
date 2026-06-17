import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TagsTable } from "./_components/tags-table";

export default function TagsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gerenciar Tags</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Tag
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tags do Sistema</CardTitle>
          <CardDescription>
            Crie categorias e rótulos para segmentar Contatos, Empresas e outros registros do CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagsTable />
        </CardContent>
      </Card>
    </div>
  );
}
