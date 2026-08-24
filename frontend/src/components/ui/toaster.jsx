import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport } from
"@/components/ui/toast";import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";

export function Toaster() {
  const { toasts } = useToast();

  return (/*#__PURE__*/
    _jsxDEV(ToastProvider, { children: [
      toasts.map(function ({ id, title, description, action, ...props }) {
        return (/*#__PURE__*/
          _jsxDEV(Toast, { ...props, children: [/*#__PURE__*/
            _jsxDEV("div", { className: "grid gap-1", children: [
              title && /*#__PURE__*/_jsxDEV(ToastTitle, { children: title }, void 0, false),
              description && /*#__PURE__*/
              _jsxDEV(ToastDescription, { children: description }, void 0, false)] }, void 0, true

            ),
            action, /*#__PURE__*/
            _jsxDEV(ToastClose, {}, void 0, false)] }, id, true
          ));

      }), /*#__PURE__*/
      _jsxDEV(ToastViewport, {}, void 0, false)] }, void 0, true
    ));

}