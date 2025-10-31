import { type SlateElementProps } from "platejs";

import { NodeApi, PathApi, SlateElement } from "platejs";

import { cn } from "@/lib/utils";
import { type TArrowListItemElement } from "../../plugins/arrow-plugin";

export function ArrowItemStatic(
  props: SlateElementProps<TArrowListItemElement>,
) {
  const path = props.editor.api.findPath(props.element) ?? [-1];
  const parentPath = PathApi.parent(path);
  const parentElement = NodeApi.get(props.editor, parentPath);

  return (
    <div className={cn("group/arrow-item relative mb-2 ml-4 flex  gap-6")}>
      {/* Chevron icon column */}
      <div className="flex h-full basis-24 shrink-0 items-center justify-center">
        <svg className="relative -top-4 z-50 aspect-square overflow-visible">
          <path
            d="M0,90L45,108L90,90L90,0L45,18L0,0Z"
            style={{
              fill:
                (parentElement?.color as string) ||
                "var(--presentation-primary)",
            }}
          ></path>
        </svg>
      </div>

      {/* Content column */}
      <SlateElement {...props}>{props.children}</SlateElement>
    </div>
  );
}
