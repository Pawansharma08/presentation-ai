import { type SlateElementProps } from "platejs";

import { SlateElement } from "platejs";

import { cn } from "@/lib/utils";

export function PresentationParagraphElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      {...props}
      className={cn("presentation-paragraph m-0 px-0 py-1 text-base")}
    >
      {props.children}
    </SlateElement>
  );
}
