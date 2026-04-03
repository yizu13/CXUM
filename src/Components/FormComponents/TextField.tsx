import { Controller, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form";

interface TextFieldProps<T extends FieldValues> {
  label: string;
  type?: string;
  name: Path<T>;
  placeholder?: string;
  rows?: number;
}

export default function TextField<T extends FieldValues>({ 
  label, 
  type = "text", 
  name, 
  placeholder, 
  rows = 4
}: TextFieldProps<T>) {

    const { control } = useFormContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1rem' }}>
      <label htmlFor={name} style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        {label}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            {type === "textarea" ? (
              <textarea
                {...field}
                id={name}
                placeholder={placeholder}
                rows={rows}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg focus:border-primary focus:outline-none transition-colors duration-300 text-gray-900 dark:text-white placeholder-gray-500`}
              />
            ) : (
              <input
                {...field}
                id={name}
                type={type}
                placeholder={placeholder}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg focus:border-primary focus:outline-none transition-colors duration-300 text-gray-900 dark:text-white placeholder-gray-500`}
              />
            )}
            
            {error && (
              <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                {error.message}
              </span>
            )}
          </>
        )}
      />
    </div>
  );
}