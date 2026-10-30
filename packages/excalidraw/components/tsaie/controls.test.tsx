import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";

import { ControlButton, ControlInput } from "./controls";

it("preserves native button actions, pressed state, ref, and disabled behavior", () => {
  const onClick = vi.fn();
  const ref = React.createRef<HTMLButtonElement>();
  const { rerender } = render(
    <ControlButton ref={ref} aria-pressed onClick={onClick}>
      Select
    </ControlButton>,
  );
  expect(ref.current?.tagName).toBe("BUTTON");
  expect(ref.current?.type).toBe("button");
  fireEvent.click(screen.getByRole("button", { name: "Select" }));
  expect(onClick).toHaveBeenCalledTimes(1);
  rerender(
    <ControlButton disabled onClick={onClick}>
      Select
    </ControlButton>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Select" }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it("preserves controlled input values, native change events, and focus refs", () => {
  const onChange = vi.fn();
  const ref = React.createRef<HTMLInputElement>();
  render(
    <ControlInput
      ref={ref}
      aria-label="Title"
      value="Example"
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Updated" },
  });
  expect(onChange).toHaveBeenCalledTimes(1);
  ref.current?.focus();
  expect(ref.current?.ownerDocument.activeElement).toBe(ref.current);
});
