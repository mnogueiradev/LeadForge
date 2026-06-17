import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ContactList } from "./_components/contact-list";

export default function ContactsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contatos</h2>
        <div className="flex items-center space-x-2">
          <Link href="/contacts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Contato
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Agenda de Contatos</CardTitle>
          <CardDescription>
            Gerencie as pessoas com quem você e sua empresa se relacionam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactList />
        </CardContent>
      </Card>
    </div>
  );
}
