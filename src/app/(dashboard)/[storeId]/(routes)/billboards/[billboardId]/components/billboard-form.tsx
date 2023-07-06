'use client';

import axios from 'axios';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { Billboard } from '@prisma/client';
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
import { BillboardCreateRequest, BillboardValidator } from '@/lib/validators/billboard';
import ImageUpload from '@/components/ui/image-upload';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface BillboardFormProps {
  initialData: Billboard | null;
}

export const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const title = initialData ? 'Edit billboard' : 'Create billboard';
  const description = initialData ? 'Edit a billboard.' : 'Add a new billboard';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<BillboardCreateRequest>({
    resolver: zodResolver(BillboardValidator),
    defaultValues: initialData || {
      label: '',
      imageUrl: '',
    },
  });

  const { mutate: createBillboard, isLoading: createIsLoading } = useMutation({
    mutationFn: async ({ label, imageUrl }: BillboardCreateRequest) => {
      const payload: BillboardCreateRequest = { label, imageUrl };
      const { data } = await axios.post(`/api/${params.storeId}/billboards`, payload);
      return data as Billboard;
    },
    onError: (error) => {
      console.log('unable to create billboard');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your billboard could not be created. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast({
        title: 'Billboard created.',
        description: 'Your billboard was successfully created.',
        variant: 'default',
      });
    },
  });

  const { mutate: updateBillBoard, isLoading: patchIsLoading } = useMutation({
    mutationFn: async ({ label, imageUrl }: BillboardCreateRequest) => {
      const payload: BillboardCreateRequest = { label, imageUrl };
      const { data } = await axios.patch(
        `/api/${params.storeId}/billboards/${params.billboardId}`,
        payload
      );
      return data as Billboard;
    },
    onError: (error) => {
      console.log('unable to update billboard');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your billboard could not be updated. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast({
        title: 'Billboard updated.',
        description: 'Your billboard was successfully updated.',
        variant: 'default',
      });
    },
  });

  const { mutate: deleteBillboard, isLoading: deleteIsLoading } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `/api/${params.storeId}/billboards/${params.billboardId}`
      );
      return data;
    },
    onError: (error) => {
      console.log('unable to delete billboard');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description:
          'Your billboard could not be deleted. Make sure you removed all categories using this billboard, then try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast({
        title: 'Billboard deleted.',
        description: 'Your billboard was successfully deleted.',
        variant: 'default',
      });
    },
  });

  const onSubmit = async (data: BillboardCreateRequest) => {
    if (initialData) {
      updateBillBoard(data);
    } else {
      createBillboard(data);
    }
  };

  const onDelete = async () => {
    deleteBillboard();
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
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={isLoading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange('')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Billboard label" {...field} />
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
