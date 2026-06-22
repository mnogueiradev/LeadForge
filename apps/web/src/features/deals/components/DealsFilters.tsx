import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '../../users/api/use-users';

export function DealsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: usersData } = useUsers();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchParams(prev => {
      if (value) prev.set('search', value);
      else prev.delete('search');
      return prev;
    });
  };

  const handleOwnerChange = (val: string) => {
    setSearchParams(prev => {
      if (val && val !== 'all') prev.set('ownerUserId', val);
      else prev.delete('ownerUserId');
      return prev;
    });
  };

  const handleStatusChange = (val: string) => {
    setSearchParams(prev => {
      if (val && val !== 'all') prev.set('status', val);
      else prev.delete('status');
      return prev;
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-xl border shadow-sm mb-6">
      <div className="relative flex-1 w-full md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar negócios..." 
          className="pl-8" 
          defaultValue={searchParams.get('search') || ''}
          onChange={handleSearch}
        />
      </div>

      <Select value={searchParams.get('ownerUserId') || 'all'} onValueChange={handleOwnerChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os responsáveis</SelectItem>
          {usersData?.data.map(user => (
            <SelectItem key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={searchParams.get('status') || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="OPEN">Abertos</SelectItem>
          <SelectItem value="WON">Ganhos</SelectItem>
          <SelectItem value="LOST">Perdidos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
