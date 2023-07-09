'use client';

import axios from 'axios';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { Billboard, Category } from '@prisma/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryValidator, CatrgoryCreateRequest } from '@/lib/validators/category';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CategoryFormProps {
  initialData: Category | null;
  billboards: Billboard[];
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, billboards }) => {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const title = initialData ? 'Edit category' : 'Create category';
  const description = initialData ? 'Edit a category.' : 'Add a new category';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<CatrgoryCreateRequest>({
    resolver: zodResolver(CategoryValidator),
    defaultValues: initialData || {
      name: '',
      billboardId: '',
    },
  });

  const { mutate: createCategory, isLoading: createIsLoading } = useMutation({
    mutationFn: async ({ name, billboardId }: CatrgoryCreateRequest) => {
      const payload: CatrgoryCreateRequest = { name, billboardId };
      const { data } = await axios.post(`/api/${params.storeId}/categories`, payload);
      return data as Category;
    },
    onError: (error) => {
      console.log('unable to create category');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your category could not be created. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast({
        title: 'Category created.',
        description: 'Your category was successfully created.',
        variant: 'default',
      });
    },
  });

  const { mutate: updateCategory, isLoading: patchIsLoading } = useMutation({
    mutationFn: async ({ name, billboardId }: CatrgoryCreateRequest) => {
      const payload: CatrgoryCreateRequest = { name, billboardId };
      const { data } = await axios.patch(
        `/api/${params.storeId}/categories/${params.categoryId}`,
        payload
      );
      return data as Category;
    },
    onError: (error) => {
      console.log('unable to update category');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your category could not be updated. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast({
        title: 'Billboard updated.',
        description: 'Your category was successfully updated.',
        variant: 'default',
      });
    },
  });

  const { mutate: deleteCategory, isLoading: deleteIsLoading } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
      return data;
    },
    onError: (error) => {
      console.log('unable to delete category');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description:
          'Your category could not be deleted. Make sure you removed all products using this category, then try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast({
        title: 'Billboard deleted.',
        description: 'Your billboard was successfully deleted.',
        variant: 'default',
      });
    },
  });

  const onSubmit = async (data: CatrgoryCreateRequest) => {
    if (initialData) {
      updateCategory(data);
    } else {
      createCategory(data);
    }
  };

  const onDelete = async () => {
    deleteCategory();
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
                    <Input disabled={isLoading} placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a billboard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
