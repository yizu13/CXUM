import { FormProvider as RHFFormProvider } from "react-hook-form";
import type { UseFormReturn, FieldValues, SubmitHandler } from "react-hook-form";

interface FormManagedProps<T extends FieldValues> {
  children: React.ReactNode;
  onSubmit: SubmitHandler<T>;
  methods: UseFormReturn<T>;
  className?: string;
}

export default function FormManaged<T extends FieldValues>({
  children,
  onSubmit,
  methods,
  className,
}: FormManagedProps<T>) {
  return (
    <RHFFormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className} noValidate>
        {children}
      </form>
    </RHFFormProvider>
  );
}
