import * as React from 'react';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Building2,
  Phone,
  Target,
  Briefcase,
  Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Módulos">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
            <Target className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/organizations'))}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Empresas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/contacts'))}>
            <Phone className="mr-2 h-4 w-4" />
            <span>Contatos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/leads'))}>
            <User className="mr-2 h-4 w-4" />
            <span>Leads</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/deals'))}>
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Negócios (Pipeline)</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/activities'))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Atividades</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/calendar'))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendário</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Busca Rápida (Exemplos)">
          <CommandItem onSelect={() => runCommand(() => navigate('/leads'))}>
            <Smile className="mr-2 h-4 w-4" />
            <span>João Silva (Lead)</span>
            <CommandShortcut>Score: 95</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/organizations'))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Acme Corp (Empresa)</span>
            <CommandShortcut>Cliente</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Configurações">
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Ajustes da Conta</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
