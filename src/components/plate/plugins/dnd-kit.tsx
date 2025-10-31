"use client";

import { DndPlugin } from "@platejs/dnd";
import { PlaceholderPlugin } from "@platejs/media/react";

import { BlockDraggable } from "@/components/plate/ui/block-draggable";

export const MultiDndPlugin = DndPlugin.extend({
  options: {
    orientation: undefined,
    isMouseDown: false,
  } as {
    orientation: "vertical" | "horizontal" | undefined;
    isMouseDown: boolean;
  },
});

export const DndKit = [
  MultiDndPlugin.configure({
    options: {
      enableScroller: true,
      onDropFiles: ({ dragItem, editor, target }) => {
        editor
          .getTransforms(PlaceholderPlugin)
          .insert.media(dragItem.files, { at: target, nextBlock: false });
      },
    },
    render: {
      aboveNodes: BlockDraggable,
      // aboveSlate: ({ children }) => (
      //   <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      // ),
    },
  }),
];
