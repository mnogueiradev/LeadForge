import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "../_components/lead-form";

export default function NewLeadPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Novo Lead</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Oportunidade</CardTitle>
          <CardDescription>
            Preencha os dados do lead para adicionar ao pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
