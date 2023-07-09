'use client';

import axios from 'axios';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { AlertModal } from '@/components/modals/alert-modal';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Size } from '@prisma/client';
import { SizeCreateRequest, SizeValidator } from '@/lib/validators/size';

interface SizeFormProps {
  initialData: Size | null;
}

export const SizeForm: React.FC<SizeFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const title = initialData ? 'Edit size' : 'Create size';
  const description = initialData ? 'Edit a size.' : 'Add a new size';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<SizeCreateRequest>({
    resolver: zodResolver(SizeValidator),
    defaultValues: initialData || {
      name: '',
      value: '',
    },
  });

  const { mutate: createSize, isLoading: createIsLoading } = useMutation({
    mutationFn: async ({ name, value }: SizeCreateRequest) => {
      const payload: SizeCreateRequest = { name, value };
      const { data } = await axios.post(`/api/${params.storeId}/sizes`, payload);
      return data as Size;
    },
    onError: (error) => {
      console.log('unable to create size');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your size could not be created. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/sizes`);
      toast({
        title: 'Size created.',
        description: 'Your size was successfully created.',
        variant: 'default',
      });
    },
  });

  const { mutate: updateSize, isLoading: patchIsLoading } = useMutation({
    mutationFn: async ({ name, value }: SizeCreateRequest) => {
      const payload: SizeCreateRequest = { name, value };
      const { data } = await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, payload);
      return data as Size;
    },
    onError: (error) => {
      console.log('unable to update size');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your size could not be updated. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/sizes`);
      toast({
        title: 'Size updated.',
        description: 'Your Size was successfully updated.',
        variant: 'default',
      });
    },
  });

  const { mutate: deleteSize, isLoading: deleteIsLoading } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);
      return data;
    },
    onError: (error) => {
      console.log('unable to delete size');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description:
          'Your size could not be deleted. Make sure you removed all products using this size, then try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/sizes`);
      toast({
        title: 'Size deleted.',
        description: 'Your size was successfully deleted.',
        variant: 'default',
      });
    },
  });

  const onSubmit = async (data: SizeCreateRequest) => {
    if (initialData) {
      updateSize(data);
    } else {
      createSize(data);
    }
  };

  const onDelete = async () => {
    deleteSize();
  };

  const isLoading = createIsLoading || patchIsLoading || deleteIsLoading;

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />

        {initialData && (
          <Button
            disabled={isLoading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Size name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Size value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
