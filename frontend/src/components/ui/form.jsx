import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext } from
"react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const Form = FormProvider;








const FormFieldContext = /*#__PURE__*/React.createContext(
  {}
);

const FormField = (


{
  ...props
}) => {
  return (/*#__PURE__*/
    _jsxDEV(FormFieldContext.Provider, { value: { name: props.name }, children: /*#__PURE__*/
      _jsxDEV(Controller, { ...props }, void 0, false) }, void 0, false
    ));

};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};





const FormItemContext = /*#__PURE__*/React.createContext(
  {}
);

const FormItem = /*#__PURE__*/React.forwardRef(


  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (/*#__PURE__*/
      _jsxDEV(FormItemContext.Provider, { value: { id }, children: /*#__PURE__*/
        _jsxDEV("div", { ref: ref, className: cn("space-y-2", className), ...props }, void 0, false) }, void 0, false
      ));

  });
FormItem.displayName = "FormItem";

const FormLabel = /*#__PURE__*/React.forwardRef(


  ({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField();

    return (/*#__PURE__*/
      _jsxDEV(Label, {
        ref: ref,
        className: cn(error && "text-destructive", className),
        htmlFor: formItemId, ...
        props }, void 0, false
      ));

  });
FormLabel.displayName = "FormLabel";

const FormControl = /*#__PURE__*/React.forwardRef(


  ({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (/*#__PURE__*/
      _jsxDEV(Slot, {
        ref: ref,
        id: formItemId,
        "aria-describedby":
        !error ?
        `${formDescriptionId}` :
        `${formDescriptionId} ${formMessageId}`,

        "aria-invalid": !!error, ...
        props }, void 0, false
      ));

  });
FormControl.displayName = "FormControl";

const FormDescription = /*#__PURE__*/React.forwardRef(


  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (/*#__PURE__*/
      _jsxDEV("p", {
        ref: ref,
        id: formDescriptionId,
        className: cn("text-sm text-muted-foreground", className), ...
        props }, void 0, false
      ));

  });
FormDescription.displayName = "FormDescription";

const FormMessage = /*#__PURE__*/React.forwardRef(


  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
      return null;
    }

    return (/*#__PURE__*/
      _jsxDEV("p", {
        ref: ref,
        id: formMessageId,
        className: cn("text-sm font-medium text-destructive", className), ...
        props, children:

        body }, void 0, false
      ));

  });
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField };