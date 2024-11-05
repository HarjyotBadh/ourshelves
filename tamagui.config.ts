import { createTamagui } from "tamagui";
import { config as configBase } from "@tamagui/config/v3";
import { createInterFont } from "@tamagui/font-inter";

const interFont = createInterFont();

const config = createTamagui({
  ...configBase,
  fonts: {
    ...configBase.fonts,
    body: interFont,
    heading: interFont,
  },
  defaultFont: "body",
});

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
