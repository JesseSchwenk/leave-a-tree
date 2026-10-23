import { SPONSOR } from "@/lib/site";

// A round rubber stamp: "Seed-funded by Tomorrow University".
export default function Stamp({ className = "" }: { className?: string }) {
  const text = `Seed-funded by ${SPONSOR} · 2026 · `;
  return (
    <svg className={`stamp ${className}`} viewBox="0 0 160 160" role="img" aria-label={`Seed-funded by ${SPONSOR}`}>
      <defs>
        <path id="stamp-ring" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0" />
      </defs>
      <circle cx="80" cy="80" r="76" className="stamp__edge" />
      <circle cx="80" cy="80" r="42" className="stamp__edge stamp__edge--thin" />
      <text className="stamp__text">
        <textPath href="#stamp-ring" textLength="364">
          {text}
        </textPath>
      </text>
      <path
        d="M80 104V78m0 0c0-10-7-17-18-17 0 10 7 17 18 17Zm0-4c0-9.5 6.5-16 17-16 0 9.5-6.5 16-17 16Z"
        className="stamp__sprout"
      />
    </svg>
  );
}
