import { type SlateElementProps } from "platejs";

import { SlateElement } from "platejs";

import { cn } from "@/lib/utils";

export function PresentationElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      className={cn(
        "presentation-element relative !select-text",
        props.className,
      )}
    >
      {props.children}
    </SlateElement>
  );
}
