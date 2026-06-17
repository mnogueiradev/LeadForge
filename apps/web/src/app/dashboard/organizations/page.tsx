import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { OrganizationList } from "./_components/organization-list";

export default function OrganizationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Empresas</h2>
        <div className="flex items-center space-x-2">
          <Link href="/organizations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Empresa
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organizações</CardTitle>
          <CardDescription>
            Gerencie as empresas e clientes do seu negócio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationList />
        </CardContent>
      </Card>
    </div>
  );
}
