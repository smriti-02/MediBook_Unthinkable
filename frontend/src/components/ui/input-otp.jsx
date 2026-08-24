import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

const InputOTP = /*#__PURE__*/React.forwardRef(


  ({ className, containerClassName, ...props }, ref) => /*#__PURE__*/
  _jsxDEV(OTPInput, {
    ref: ref,
    containerClassName: cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    ),
    className: cn("disabled:cursor-not-allowed", className), ...
    props }, void 0, false
  )
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = /*#__PURE__*/React.forwardRef(


  ({ className, ...props }, ref) => /*#__PURE__*/
  _jsxDEV("div", { ref: ref, className: cn("flex items-center", className), ...props }, void 0, false)
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = /*#__PURE__*/React.forwardRef(


  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (/*#__PURE__*/
      _jsxDEV("div", {
        ref: ref,
        className: cn(
          "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
          isActive && "z-10 ring-2 ring-ring ring-offset-background",
          className
        ), ...
        props, children: [

        char,
        hasFakeCaret && /*#__PURE__*/
        _jsxDEV("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /*#__PURE__*/
          _jsxDEV("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" }, void 0, false) }, void 0, false
        )] }, void 0, true

      ));

  });
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = /*#__PURE__*/React.forwardRef(


  ({ ...props }, ref) => /*#__PURE__*/
  _jsxDEV("div", { ref: ref, role: "separator", ...props, children: /*#__PURE__*/
    _jsxDEV(Dot, {}, void 0, false) }, void 0, false
  )
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };