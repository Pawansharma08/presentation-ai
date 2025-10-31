import type * as React from "react";

import { type SlateElementProps, type TImageElement } from "platejs";

import { SlateElement } from "platejs";

import { cn } from "@/lib/utils";
import { type ImageCropSettings } from "../../../utils/types";

// Static renderer for presentation image that preserves crop styles
export function PresentationImageElementStatic(
  props: SlateElementProps<
    TImageElement & {
      query?: string;
      cropSettings?: ImageCropSettings;
    }
  >,
) {
  const { url, query, cropSettings } = props.element;

  const imageStyles: React.CSSProperties = {
    objectFit: cropSettings?.objectFit ?? "cover",
    objectPosition: cropSettings
      ? `${cropSettings.objectPosition.x}% ${cropSettings.objectPosition.y}%`
      : "50% 50%",
    transform: `scale(${cropSettings?.zoom ?? 1})`,
    transformOrigin: cropSettings
      ? `${cropSettings.objectPosition.x}% ${cropSettings.objectPosition.y}%`
      : "50% 50%",
  };

  return (
    <SlateElement {...props} className={cn(props.className)}>
      {/** biome-ignore lint/performance/noImgElement: This is a valid use case */}
      <img
        src={url}
        alt={query ?? ""}
        className={cn("presentation-image")}
        style={imageStyles}
      />
      {props.children}
    </SlateElement>
  );
}
