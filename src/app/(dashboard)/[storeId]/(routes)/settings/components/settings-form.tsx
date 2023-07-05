'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { Store } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

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
import { ApiAlert } from '@/components/ui/api-alert';
import { useOrigin } from '@/hooks/use-origin';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialData: Store;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { mutate: updateSettings, isLoading } = useMutation({
    mutationFn: async ({ name }: SettingsFormValues) => {
      const payload: SettingsFormValues = { name };
      const { data } = await axios.patch(`/api/stores/${params.storeId}`, payload);
      return data as Store;
    },
    onError: (error) => {
      console.log('unable to update store');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your store could not be updated. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Store updated',
        description: 'Your store was successfully updated.',
        variant: 'default',
      });
      router.refresh();
    },
  });

  const { mutate: deleteStore, isLoading: isDeleteLoading } = useMutation({
    mutationFn: async () => {
      return await axios.delete(`/api/stores/${params.storeId}`);
    },
    onError: (error) => {
      console.log('unable to delete store');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your store could not be deleted. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Store deleted',
        description: 'Your store was successfully deleted.',
        variant: 'default',
      });
      router.refresh();
      router.push('/');
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    updateSettings(data);
  };

  const onDelete = async () => {
    deleteStore();
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading || isDeleteLoading}
      />
      <div className="flex items-center justify-between">
        <Heading title="Store settings" description="Manage store preferences" />
        <Button
          disabled={isLoading || isDeleteLoading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading || isDeleteLoading}
                      placeholder="Store name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading || isDeleteLoading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        variant="public"
        description={`${origin}/api/${params.storeId}`}
      />
    </>
  );
};
