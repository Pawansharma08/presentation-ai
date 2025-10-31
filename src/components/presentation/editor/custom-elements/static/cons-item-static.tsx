import { cn } from "@/lib/utils";
import { SlateElement, type SlateElementProps } from "platejs";

export function ConsItemStatic(props: SlateElementProps) {
  return (
    <div
      className={cn("rounded-lg p-6 text-white")}
      style={{
        background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
      }}
    >
      <SlateElement {...props}>{props.children}</SlateElement>
    </div>
  );
}
