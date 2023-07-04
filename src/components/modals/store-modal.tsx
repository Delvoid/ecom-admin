import { Modal } from '@/components/ui/modal';
import { useStoreModal } from '@/hooks/use-store-modal';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { StoreCreateRequest } from '@/lib/validators/store';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Store } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(1),
});

const StoreModal = () => {
  const { toast } = useToast();
  const { isOpen, onClose } = useStoreModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const { mutate: createStore, isLoading } = useMutation({
    mutationFn: async ({ name }: StoreCreateRequest) => {
      const payload: StoreCreateRequest = { name };
      const { data } = await axios.post('/api/stores', payload);
      return data as Store;
    },
    onError: (error) => {
      console.log('unable to create store');
      console.log(error);
      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not published. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      // Not sure why router.push(`/${data.id}`) router.refresh() doesn't work here
      window.location.assign(`/${data.id}`);
      toast({
        title: 'Store created.',
        description: 'Your store was successfully created.',
        variant: 'default',
      });
    },
  });

  const onSubmit = async (values: StoreCreateRequest) => {
    const payload: StoreCreateRequest = { name: values.name };
    createStore(payload);
  };

  return (
    <Modal
      title="Create store"
      description="Add a new store to manage products and categories."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-4 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="E-Commerce" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button disabled={isLoading} variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={isLoading} isLoading={isLoading} type="submit">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};

export default StoreModal;
