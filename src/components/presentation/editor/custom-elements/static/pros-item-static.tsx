import { cn } from "@/lib/utils";
import { SlateElement, type SlateElementProps } from "platejs";

export function ProsItemStatic(props: SlateElementProps) {
  return (
    <div
      className={cn("rounded-lg p-6 text-white")}
      style={{
        background: "linear-gradient(135deg, #27ae60 0%, #229954 100%)",
      }}
    >
      <SlateElement {...props}>{props.children}</SlateElement>
    </div>
  );
}
