'use client';

import axios from 'axios';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { AlertModal } from '@/components/modals/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ProductColumn } from './columns';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CellActionProps {
  data: ProductColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const { mutate: deleteProduct, isLoading: deleteIsLoading } = useMutation({
    mutationFn: async () => {
      return await axios.delete(`/api/${params.storeId}/products/${data.id}`);
    },
    onError: (error) => {
      console.log('unable to delete product');
      console.log(error);
      setOpen(false);
      return toast({
        title: 'Something went wrong.',
        description: 'Your product could not be deleted.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      toast({
        title: 'Product deleted.',
        description: 'Your product was successfully deleted.',
        variant: 'default',
      });
      setOpen(false);
    },
  });

  const onConfirm = async () => {
    deleteProduct();
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      icon: <Copy />,
      title: 'Product ID copied to clipboard.',
      variant: 'default',
    });
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={deleteIsLoading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" /> Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
