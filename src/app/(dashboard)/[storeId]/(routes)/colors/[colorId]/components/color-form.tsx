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
import { Color } from '@prisma/client';
import { ColorCreateRequest, ColorValidator } from '@/lib/validators/color';

interface ColorFormProps {
  initialData: Color | null;
}

export const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);

  const title = initialData ? 'Edit color' : 'Create color';
  const description = initialData ? 'Edit a color.' : 'Add a new color';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<ColorCreateRequest>({
    resolver: zodResolver(ColorValidator),
    defaultValues: initialData || {
      name: '',
      value: '',
    },
  });

  const { mutate: createColor, isLoading: createIsLoading } = useMutation({
    mutationFn: async ({ name, value }: ColorCreateRequest) => {
      const payload: ColorCreateRequest = { name, value };
      const { data } = await axios.post(`/api/${params.storeId}/colors`, payload);
      return data as Color;
    },
    onError: (error) => {
      console.log('unable to create color');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your color could not be created. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast({
        title: 'Color created.',
        description: 'Your color was successfully created.',
        variant: 'default',
      });
    },
  });

  const { mutate: updateColor, isLoading: patchIsLoading } = useMutation({
    mutationFn: async ({ name, value }: ColorCreateRequest) => {
      const payload: ColorCreateRequest = { name, value };
      const { data } = await axios.patch(
        `/api/${params.storeId}/colors/${params.colorId}`,
        payload
      );
      return data as Color;
    },
    onError: (error) => {
      console.log('unable to update color');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your color could not be updated. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast({
        title: 'Color updated.',
        description: 'Your color was successfully updated.',
        variant: 'default',
      });
    },
  });

  const { mutate: deleteColor, isLoading: deleteIsLoading } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
      return data;
    },
    onError: (error) => {
      console.log('unable to delete color');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description:
          'Your color could not be deleted. Make sure you removed all products using this color, then try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast({
        title: 'Color deleted.',
        description: 'Your color was successfully deleted.',
        variant: 'default',
      });
    },
  });

  const onSubmit = async (data: ColorCreateRequest) => {
    if (initialData) {
      updateColor(data);
    } else {
      createColor(data);
    }
  };

  const onDelete = async () => {
    deleteColor();
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
                    <Input disabled={isLoading} placeholder="Color name" {...field} />
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
                    <Input disabled={isLoading} placeholder="Color value" {...field} />
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
