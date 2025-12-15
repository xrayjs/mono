import type { Component } from "solid-js";
import type { ColorValue } from "@xray/schema";
import { ColorSwatch } from "./ColorSwatch";
import { ColorInputs } from "./ColorInputs";
import { colorToCss } from "../../utils/colorUtils";

interface ColorRendererProps {
  value: ColorValue;
}

export const ColorRenderer: Component<ColorRendererProps> = (props) => {
  const cssValue = () => colorToCss(props.value);

  return (
    <div class="flex gap-4">
      <ColorSwatch value={props.value} size={80} />
      <div class="flex-1 min-w-0">
        <ColorInputs value={props.value} />
        {/* CSS Value */}
        <div class="mt-3">
          <label class="block text-xs text-neutral-500 mb-1">CSS</label>
          <code class="block px-2 py-1.5 bg-neutral-900 text-neutral-100 text-xs rounded font-mono overflow-x-auto">
            {cssValue()}
          </code>
        </div>
      </div>
    </div>
  );
};
