import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Shield, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import { useToast } from '@/components/ui/toaster';
import { getApiErrorMessage } from '@/api/client';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(4, 'Nova senha deve ter ao menos 4 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;

export function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      await authApi.changePassword(values.currentPassword, values.newPassword);
      toast({ title: 'Senha alterada com sucesso', variant: 'success' });
      reset();
    } catch (err) {
      toast({ title: 'Erro', description: getApiErrorMessage(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Configurações" description="Ajustes da conta" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Conta
            </CardTitle>
            <CardDescription>Informações do usuário atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Perfil</span>
              <span className="font-medium">{user?.role}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Trocar senha
            </CardTitle>
            <CardDescription>Atualize a senha do administrador</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label>Senha atual</Label>
                <Input type="password" {...register('currentPassword')} />
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Nova senha</Label>
                <Input type="password" {...register('newPassword')} />
                {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Confirmar nova senha</Label>
                <Input type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" /> Sobre o Futskol Admin
            </CardTitle>
            <CardDescription>Sistema de gestão financeira da pelada</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Gerencie jogadores, mensalidades, custos e caixa num só lugar. Cores da seleção brasileira:
              <span className="ml-2 inline-block h-3 w-3 rounded-full bg-brand-green align-middle" /> verde e
              <span className="ml-2 inline-block h-3 w-3 rounded-full bg-brand-yellow align-middle" /> amarelo.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
