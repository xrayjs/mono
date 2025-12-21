import type { Component } from "solid-js";
import type { ColorValue } from "@xray/schema";
import { ColorSwatch as UIColorSwatch } from "@xray/ui";
import { colorToCss } from "../../utils/colorUtils";

interface ColorSwatchProps {
  value: ColorValue;
  size?: number;
}

export const ColorSwatch: Component<ColorSwatchProps> = (props) => {
  const cssColor = () => colorToCss(props.value);

  return <UIColorSwatch color={cssColor()} size={props.size} />;
};
