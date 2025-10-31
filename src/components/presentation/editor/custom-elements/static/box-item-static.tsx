import { cn } from "@/lib/utils";
import {
  NodeApi,
  PathApi,
  SlateElement,
  type SlateElementProps,
} from "platejs";

export function BoxItemStatic(props: SlateElementProps) {
  const path = props.editor.api.findPath(props.element) ?? [-1];
  const parentPath = PathApi.parent(path);
  const parentElement = NodeApi.get(props.editor, parentPath);

  return (
    <div
      className={cn(
        "rounded-md border p-4",
        "[&_:is(.presentation-heading)]:[-webkit-background-clip:unset!important;]",
        "[&_:is(.presentation-heading)]:[-webkit-text-fill-color:unset!important;]",
        "[&_:is(.presentation-heading)]:[background-clip:unset!important;]",
        "[&_:is(.presentation-heading)]:[background:none!important;]",
        "[&_:is(.presentation-heading)]:!text-primary",
      )}
      style={{
        backgroundColor:
          (parentElement?.color as string) || "var(--presentation-primary)",
        borderColor: "hsl(var(--border))",
        color: "var(--presentation-background)",
      }}
    >
      <SlateElement {...props}>{props.children}</SlateElement>
    </div>
  );
}
