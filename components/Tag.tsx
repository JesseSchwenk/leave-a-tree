import { PLANTING_YEAR, type Material } from "@/lib/site";

type Props = {
  name: string;
  material: Material;
  size?: "lg" | "sm";
};

// Long names shrink so they always fit on one line of the tag.
function nameScale(name: string, size: "lg" | "sm") {
  const fits = size === "lg" ? 12 : 11;
  const len = Math.max(name.length, 1);
  return Math.max(0.5, Math.min(1, fits / len));
}

export default function Tag({ name, material, size = "lg" }: Props) {
  const shown = name.trim() || "Your name";
  return (
    <div
      className={`tag tag--${material} tag--${size}`}
      style={{ "--name-scale": nameScale(shown, size) } as React.CSSProperties}
    >
      <span className="tag__hole" aria-hidden="true" />
      <span className="tag__kicker">Planted for</span>
      <span className="tag__name">{shown}</span>
      <span className="tag__meta">Lithuania, {PLANTING_YEAR}</span>
    </div>
  );
}
