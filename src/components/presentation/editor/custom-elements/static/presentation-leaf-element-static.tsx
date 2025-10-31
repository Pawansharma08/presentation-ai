import { type SlateLeafProps } from "platejs";

import { SlateLeaf } from "platejs";

import { cn } from "@/lib/utils";

export function PresentationLeafElementStatic(props: SlateLeafProps) {
  return (
    <SlateLeaf {...props} className={cn("presentation-leaf", props.className)}>
      {props.children}
    </SlateLeaf>
  );
}
