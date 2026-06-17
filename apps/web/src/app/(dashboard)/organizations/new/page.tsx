import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationForm } from "../_components/organization-form";

export default function NewOrganizationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Nova Empresa</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Empresa</CardTitle>
          <CardDescription>
            Preencha os dados da nova empresa para adicioná-la ao seu CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
