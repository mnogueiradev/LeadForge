'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { File, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Attachment = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  uploadedBy: { id: string; name: string } | null;
};

export function LeadAttachments({ leadId }: { leadId: string }) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments', 'LEAD', leadId],
    queryFn: async () => {
      const response = await api.get(`/attachments/LEAD/${leadId}`);
      return response.data as Attachment[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/attachments/LEAD/${leadId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'LEAD', leadId] });
      toast.success('Arquivo anexado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao anexar arquivo');
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/attachments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', 'LEAD', leadId] });
      toast.success('Anexo removido');
    },
    onError: () => {
      toast.error('Erro ao remover anexo');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  if (isLoading) {
    return <div>Carregando anexos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Anexos</CardTitle>
            <CardDescription>Documentos, propostas e imagens associadas.</CardDescription>
          </div>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button asChild variant="outline" disabled={isUploading} className="cursor-pointer">
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Enviando...' : 'Fazer Upload'}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attachments?.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Nenhum anexo encontrado.</p>
          )}
          {attachments?.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <a href={process.env.NEXT_PUBLIC_API_URL + file.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline text-primary">
                    {file.originalName}
                  </a>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>{format(new Date(file.createdAt), 'dd/MM/yy HH:mm')}</span>
                    {file.uploadedBy && (
                      <>
                        <span>•</span>
                        <span>{file.uploadedBy.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
