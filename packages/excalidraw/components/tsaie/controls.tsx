import { Button as BaseButton } from "@base-ui/react/button";
import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import React, { forwardRef } from "react";

/** Native-compatible controls: editor actions, refs and event ownership stay intact. */
export const ControlButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <BaseButton
    ref={ref}
    type={type}
    className={clsx("tsaie-control", className)}
    {...props}
  />
));
ControlButton.displayName = "ControlButton";

export const ControlInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <BaseInput ref={ref} className={clsx("tsaie-input", className)} {...props} />
));
ControlInput.displayName = "ControlInput";
