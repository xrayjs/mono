import type { Component } from "solid-js";
import type { ColorValue } from "@xray/schema";
import { colorToCss, isLightColor } from "../../utils/colorUtils";

interface ColorSwatchProps {
  value: ColorValue;
  size?: number;
}

export const ColorSwatch: Component<ColorSwatchProps> = (props) => {
  const size = () => props.size ?? 80;
  const cssColor = () => colorToCss(props.value);
  const isLight = () => isLightColor(props.value);
  const hasAlpha = () => (props.value.alpha ?? 1) < 1;

  return (
    <div
      class="relative rounded-lg overflow-hidden border"
      style={{
        width: `${size()}px`,
        height: `${size()}px`,
        "border-color": isLight() ? "rgba(0,0,0,0.1)" : "transparent",
      }}
    >
      {/* Checkered background for alpha */}
      <div
        class="absolute inset-0"
        style={{
          "background-image": hasAlpha()
            ? `linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
               linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
               linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
               linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)`
            : "none",
          "background-size": "12px 12px",
          "background-position": "0 0, 0 6px, 6px -6px, -6px 0",
          "background-color": hasAlpha() ? "#fff" : "transparent",
        }}
      />
      {/* Color layer */}
      <div
        class="absolute inset-0"
        style={{ "background-color": cssColor() }}
      />
    </div>
  );
};
