import type { CSSProperties } from "react";
import type { Tag } from "~/service/service";

export type EventColorResource = {
  color?: string | null;
  tags?: unknown[];
};

const FALLBACK_COLOR = "#3399FF";
const COMPLETED_BACKGROUND_OPACITY = 0.6;

function hexToRgba(hex: string, alpha: number) {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return hex;
  }
  let chars = hex.substring(1).split("");
  if (chars.length === 3) {
    chars = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]];
  }
  const value = chars.join("");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getEventStyleProps(
  resource: EventColorResource | undefined,
  allUserTags: Tag[],
  isCompleted = false,
): CSSProperties {
  if (!resource) return { backgroundColor: FALLBACK_COLOR };

  let baseColor = FALLBACK_COLOR;
  let gradient: string | null = null;

  if (resource.color && resource.color !== FALLBACK_COLOR) {
    baseColor = resource.color;
  } else {
    const tagColors = (resource.tags || [])
      .map((tagRef: any) => {
        if (typeof tagRef === "object" && tagRef !== null && tagRef.color) {
          return tagRef.color as string;
        }

        if (typeof tagRef !== "object") {
          const found = allUserTags.find(
            (tag) =>
              tag.id === tagRef ||
              tag.name_pt === tagRef ||
              tag.name_en === tagRef,
          );
          return found?.color;
        }

        return null;
      })
      .filter((color): color is string => !!color);

    if (tagColors.length > 0) {
      baseColor = tagColors[0];
      if (tagColors.length > 1) {
        gradient = `linear-gradient(135deg, ${tagColors.join(",")})`;
      }
    }
  }

  if (isCompleted) {
    return {
      backgroundColor: hexToRgba(baseColor, COMPLETED_BACKGROUND_OPACITY),
    };
  }

  if (gradient) return { backgroundImage: gradient };
  return { backgroundColor: baseColor };
}
