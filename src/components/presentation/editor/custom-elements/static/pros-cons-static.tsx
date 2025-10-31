import { cn } from "@/lib/utils";
import { SlateElement, type SlateElementProps } from "platejs";

export default function ProsConsGroupStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props}>
      <div className={cn("grid gap-6 md:grid-cols-2")}>{props.children}</div>
    </SlateElement>
  );
}
