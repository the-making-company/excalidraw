import clsx from "clsx";
import React from "react";

import { ControlButton } from "./tsaie/controls";

import { checkIcon } from "./icons";

export const CheckboxItem: React.FC<{
  checked: boolean;
  onChange: (checked: boolean, event: React.MouseEvent) => void;
  className?: string;
  children?: React.ReactNode;
}> = ({ children, checked, onChange, className }) => {
  return (
    <div
      className={clsx("Checkbox", className, { "is-checked": checked })}
      onClick={(event) => {
        onChange(!checked, event);
        (
          (event.currentTarget as HTMLDivElement).querySelector(
            ".Checkbox-box",
          ) as HTMLButtonElement
        ).focus();
      }}
    >
      <ControlButton
        type="button"
        className="Checkbox-box"
        role="checkbox"
        aria-checked={checked}
      >
        {checkIcon}
      </ControlButton>
      <div className="Checkbox-label">{children}</div>
    </div>
  );
};
