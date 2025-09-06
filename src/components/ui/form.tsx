"use client";

import * as React from "react";
import { Controller, FormProvider, type ControllerProps, type FieldPath, type FieldValues, useFormContext } from "react-hook-form";
import { cn } from "@/src/lib/cn";
import Label from "@/src/components/ui/label";

export function Form<TFieldValues extends FieldValues>({ children, ...form }: React.PropsWithChildren<{ [K in keyof TFieldValues]?: any }>) {
  // Accept any props spread from useForm return
  return <FormProvider {...(form as any)}>{children}</FormProvider>;
}

type FormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> = ControllerProps<TFieldValues, TName> & {
  children?: React.ReactNode;
};

const FieldCtx = React.createContext<{ error?: string } | null>(null);

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>(
  props: FormFieldProps<TFieldValues, TName>
) {
  const { render, ...rest } = props as any;
  return (
    <Controller
      {...(rest as any)}
      render={(fieldRenderProps) => (
        <FieldCtx.Provider value={{ error: fieldRenderProps.fieldState.error?.message }}>
          {render(fieldRenderProps)}
        </FieldCtx.Provider>
      )}
    />
  );
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export const FormLabel = Label;

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function FormMessage({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = React.useContext(FieldCtx);
  const message = ctx?.error;
  if (!message) return null;
  return (
    <p className={cn("text-sm text-red-600", className)} {...props}>
      {message}
    </p>
  );
}

export function useFormFieldError() {
  return React.useContext(FieldCtx);
}

