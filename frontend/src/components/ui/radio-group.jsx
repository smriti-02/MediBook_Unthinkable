import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const RadioGroup = /*#__PURE__*/React.forwardRef(


  ({ className, ...props }, ref) => {
    return (/*#__PURE__*/
      _jsxDEV(RadioGroupPrimitive.Root, {
        className: cn("grid gap-2", className), ...
        props,
        ref: ref }, void 0, false
      ));

  });
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = /*#__PURE__*/React.forwardRef(


  ({ className, ...props }, ref) => {
    return (/*#__PURE__*/
      _jsxDEV(RadioGroupPrimitive.Item, {
        ref: ref,
        className: cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ), ...
        props, children: /*#__PURE__*/

        _jsxDEV(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center", children: /*#__PURE__*/
          _jsxDEV(Circle, { className: "h-2.5 w-2.5 fill-current text-current" }, void 0, false) }, void 0, false
        ) }, void 0, false
      ));

  });
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };