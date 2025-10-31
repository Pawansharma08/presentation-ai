import { SlateElement, type SlateElementProps } from "platejs";
import { type TArrowListElement } from "../../plugins/arrow-plugin";

export default function ArrowListStatic(
  props: SlateElementProps<TArrowListElement>,
) {
  return (
    <div className="my-4 mb-8 flex w-full flex-col overflow-visible">
      {/* Timeline items container */}
      <SlateElement {...props}>{props.children}</SlateElement>
    </div>
  );
}
