import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';

import { useAuth } from '@/providers/auth-provider';
import { useAppearance } from '@/providers/appearance-provider';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { login } = useAuth();
  const { logoUrl } = useAppearance();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError(null);
      await login(values);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Ocorreu um erro ao fazer login. Tente novamente.');
      }
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-[400px] flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          {logoUrl ? (
            <div className="mb-4 flex items-center justify-center">
              <img src={logoUrl} alt="Logo" className="max-h-16 object-contain" />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-emerald-500" />
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Insira suas credenciais para acessar sua conta
          </p>
        </div>

        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nome@empresa.com.br"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Sua senha"
                          disabled={isLoading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-red-500 dark:text-red-400 text-center font-medium">
                  {error}
                </div>
              )}

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Fazer login
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Ainda não tem uma conta?{' '}
            <Link
              to="/register"
              className="underline underline-offset-4 hover:text-emerald-500"
            >
              Crie uma agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
