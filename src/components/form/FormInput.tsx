import React from 'react';
import { FieldErrors, UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormInputProps<T extends FieldValues = FieldValues> {
  errors: FieldErrors<T>;
  placeholder?: string;
  label: string;
  id: string;
  register: UseFormRegister<T>;
  name: Path<T>;
  type?: string;
}

export const FormInput = <T extends FieldValues = FieldValues>({
  errors,
  placeholder,
  label,
  id,
  register,
  name,
  type = 'text',
}: FormInputProps<T>) => {
  const error = errors[name];

  return (
    <div className="mb-4">
      <Label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error.message as string}
        </p>
      )}
    </div>
  );
};
