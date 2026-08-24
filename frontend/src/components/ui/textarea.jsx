import * as React from "react";

import { cn } from "@/lib/utils";import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";




const Textarea = /*#__PURE__*/React.forwardRef(
  ({ className, ...props }, ref) => {
    return (/*#__PURE__*/
      _jsxDEV("textarea", {
        className: cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        ),
        ref: ref, ...
        props }, void 0, false
      ));

  }
);
Textarea.displayName = "Textarea";

export { Textarea };