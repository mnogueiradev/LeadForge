import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteUser, User } from '../api/use-users';
import { toast } from 'sonner';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function DeleteUserModal({ isOpen, onClose, user }: DeleteUserModalProps) {
  const [password, setPassword] = React.useState('');
  const deleteMutation = useDeleteUser();

  // Reset password field when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setPassword('');
    }
  }, [isOpen]);

  if (!user) return null;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('A senha é obrigatória para realizar a exclusão.');
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        id: user.id,
        adminPassword: password,
      });
      toast.success('Usuário excluído com sucesso.');
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao excluir usuário. Verifique sua senha.';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Usuário</DialogTitle>
          <DialogDescription className="space-y-4 text-left">
            <p>
              Você está prestes a excluir o usuário <strong>{user.firstName} {user.lastName}</strong>.
              <br />
              Este usuário será desativado, mas seus registros (como negócios e contatos) permanecerão no sistema.
            </p>
            <div className="space-y-2 mt-4">
              <Label htmlFor="admin-password">Sua Senha de Administrador</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Insira sua senha para confirmar"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!password || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
