import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "../_components/contact-form";

export default function NewContactPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Novo Contato</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Contato</CardTitle>
          <CardDescription>
            Preencha os dados do novo contato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </div>
  );
}
