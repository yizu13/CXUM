import { FormProvider } from 'react-hook-form';

type FormManagedProps = {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: any;
  className?: string;
}

export default function FormManaged({ children, onSubmit, methods, className }: FormManagedProps) {
  return (
    <FormProvider {...methods}>
        <form onSubmit={onSubmit} className={className}>
            {children}
            </form>
        
    </FormProvider>
  );
}