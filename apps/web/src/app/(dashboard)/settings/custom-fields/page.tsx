import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomFieldsTable } from "./_components/custom-fields-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomFieldsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Campos Personalizados</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Criar Campo
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Campos</CardTitle>
          <CardDescription>
            Crie atributos adicionais para as entidades do CRM sem precisar alterar código.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="CONTACT" className="w-full">
            <TabsList>
              <TabsTrigger value="CONTACT">Contatos</TabsTrigger>
              <TabsTrigger value="ORGANIZATION">Empresas</TabsTrigger>
            </TabsList>
            <TabsContent value="CONTACT">
              <CustomFieldsTable entityType="CONTACT" />
            </TabsContent>
            <TabsContent value="ORGANIZATION">
              <CustomFieldsTable entityType="ORGANIZATION" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
