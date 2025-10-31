import { type SlateLeafProps } from "platejs";

import { usePresentationState } from "@/states/presentation-state";
import { SlateLeaf } from "platejs";

export function GeneratingLeafStatic(props: SlateLeafProps) {
  const { isGeneratingPresentation } = usePresentationState();
  type LeafWithGenerating = { generating?: boolean };
  const isGenerating =
    isGeneratingPresentation &&
    Boolean(
      (props.leaf as unknown as LeafWithGenerating | undefined)?.generating,
    );

  return (
    <SlateLeaf {...props}>
      <span className="flex items-end gap-1">
        {props.children}
        {isGenerating && (
          <span
            style={{
              color: "var(--presentation-text , black) !important",
              backgroundColor: "var(--presentation-text , black) !important",
            }}
            className="animate-blink z-[1000] max-h-8"
          >
            |
          </span>
        )}
      </span>
    </SlateLeaf>
  );
}
