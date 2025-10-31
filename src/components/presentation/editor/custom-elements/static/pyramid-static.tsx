import { type SlateElementProps } from "platejs";

import { SlateElement } from "platejs";

export default function PyramidStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props}>
      <div className="my-4 mb-8 flex w-full flex-col overflow-visible">
        {props.children}
      </div>
    </SlateElement>
  );
}
