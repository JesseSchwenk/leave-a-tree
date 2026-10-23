"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import Stamp from "./Stamp";
import Tag from "./Tag";
import {
  GIFT_PRICE,
  ledger,
  paymentLinks,
  subscription,
  team,
  tierByMaterial,
  tiers,
  type Material,
  type Tier,
} from "@/lib/site";

type LinkKey = keyof typeof paymentLinks;

// Remembered so the thanks page can show the buyer their tag.
function rememberChoice(name: string, material: Material) {
  try {
    sessionStorage.setItem("lat:name", name);
    sessionStorage.setItem("lat:material", material);
  } catch {}
}

const PayContext = createContext<{
  name: string;
  notify: (msg: string) => void;
  choose: (tier: Tier) => void;
}>({
  name: "",
  notify: () => {},
  choose: () => {},
});

// A payment button: a real link when configured, a clear notice when not.
function PayButton({
  linkKey,
  label,
  className,
  tagMaterial,
}: {
  linkKey: LinkKey;
  label: string;
  className: string;
  tagMaterial?: Material;
}) {
  const { name, notify } = useContext(PayContext);
  const href = paymentLinks[linkKey];
  if (href) {
    return (
      <a
        className={className}
        href={href}
        onClick={() => tagMaterial && rememberChoice(name.trim(), tagMaterial)}
      >
        {label}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={() => notify(`The "${linkKey}" payment link isn't set yet. Add it in lib/site.ts.`)}
    >
      {label}
    </button>
  );
}

// Opens the order form for a tree tier.
function ChooseButton({ tier, label, className }: { tier: Tier; label: string; className: string }) {
  const { choose } = useContext(PayContext);
  return (
    <button type="button" className={className} onClick={() => choose(tier)}>
      {label}
    </button>
  );
}

// Order details before checkout. Nothing is sent anywhere yet: on submit it goes to the
// tier's payment link if one is set, otherwise straight to the thanks page.
function OrderModal({
  tier,
  initialName,
  onClose,
}: {
  tier: Tier;
  initialName: string;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tagName, setTagName] = useState(initialName);
  const [gift, setGift] = useState(false);
  const price = tier.price + (gift ? GIFT_PRICE : 0);

  // No close() in cleanup: in dev, Strict Mode re-runs this effect, and closing would fire
  // onClose and unmount the modal right after it opens. Unmounting removes it anyway.
  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    rememberChoice(tagName.trim(), tier.material);
    const giftKey = `${tier.id}Gift` as LinkKey;
    const href =
      (gift && paymentLinks[giftKey]) ||
      paymentLinks[tier.id] ||
      `/thanks/?tier=${tier.id}${gift ? "&gift=1" : ""}`;
    window.location.href = href;
  };

  return (
    <dialog
      ref={dialog}
      className="order"
      aria-labelledby="order-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="order__inner" onSubmit={submit}>
        <div className="order__preview" data-material={tier.material}>
          <span className="order__kicker">Leave a Tree · {tier.name}</span>
          <div className="order__tag">
            <span className="hanger__twine" aria-hidden="true" />
            <Tag name={tagName} material={tier.material} />
          </div>
          <p className="order__blurb">{tier.blurb}</p>
        </div>

        <div className="order__form">
          <div className="order__head">
            <h2 id="order-title" className="order__title">
              Your {tier.name} tree
            </h2>
            <button type="button" className="order__close" aria-label="Close" onClick={onClose}>
              ×
            </button>
          </div>

          <label className="field">
            <span className="field__label">Name on the tag</span>
            <input
              className="field__input"
              type="text"
              required
              value={tagName}
              maxLength={28}
              placeholder="e.g. Ona Petraitė"
              autoComplete="off"
              onChange={(e) => setTagName(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Your email</span>
            <input
              className="field__input"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
            <span className="field__hint">Planting photo and receipt go here.</span>
          </label>

          <label className="field">
            <span className="field__label">
              Dedication <span className="field__optional">optional</span>
            </span>
            <textarea
              className="field__input field__input--area"
              rows={2}
              maxLength={140}
              placeholder="For Grandma, who taught us the names of trees."
            />
          </label>

          <label className="check">
            <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
            Send it as a gift (+€{GIFT_PRICE})
          </label>

          {gift && (
            <div className="order__gift">
              <label className="field">
                <span className="field__label">Recipient name</span>
                <input className="field__input" type="text" required autoComplete="off" />
              </label>
              <label className="field">
                <span className="field__label">Recipient email</span>
                <input className="field__input" type="email" required autoComplete="off" />
              </label>
            </div>
          )}

          <div className="order__foot">
            <p className="order__total">
              Total <strong>€{price}</strong>
            </p>
            <button type="submit" className="btn btn--ink">
              Continue to payment
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

export default function Landing() {
  const [name, setName] = useState("");
  const [material, setMaterial] = useState<Material>("wood");
  const [toast, setToast] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<Tier | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  return (
    <PayContext.Provider value={{ name, notify, choose: setOrdering }}>
      <Header />
      <main>
        <Hero name={name} setName={setName} material={material} setMaterial={setMaterial} />
        <Packets name={name} />
        <Steps />
        <Updates name={name} />
        <Team />
        <Ledger />
      </main>
      <Footer />
      {ordering && (
        <OrderModal tier={ordering} initialName={name} onClose={() => setOrdering(null)} />
      )}
      <div className="toast" role="status" aria-live="polite" data-open={toast ? "true" : "false"}>
        {toast}
      </div>
    </PayContext.Provider>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="wrap header__inner">
        <Logo />
        <nav className="header__nav" aria-label="Main">
          <a href="#tags">Tags</a>
          <a href="#how">How it works</a>
          <a href="#updates">Growth updates</a>
          <a href="#team">Team</a>
        </nav>
        <a className="btn btn--ink btn--sm" href="#tags">
          Plant a tree
        </a>
      </div>
    </header>
  );
}

function Branch() {
  return (
    <svg className="branch" viewBox="0 0 600 120" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
      <g>
        <path d="M640 30 C 520 40, 430 22, 330 44 S 140 58, 40 40" className="branch__wood" />
        <path d="M250 50 C 230 70, 200 82, 176 84" className="branch__twig" />
        <path d="M430 34 C 450 12, 476 4, 500 6" className="branch__twig" />
        <path d="M110 46 C 96 30, 80 24, 64 24" className="branch__twig" />
      </g>
      <g className="branch__leaves">
        <ellipse cx="170" cy="86" rx="20" ry="8" transform="rotate(20 170 86)" />
        <ellipse cx="505" cy="6" rx="20" ry="8" transform="rotate(-15 505 6)" />
        <ellipse cx="58" cy="24" rx="17" ry="7" transform="rotate(10 58 24)" className="branch__leaf-light" />
        <ellipse cx="560" cy="58" rx="18" ry="7" transform="rotate(25 560 58)" className="branch__leaf-light" />
        <path d="M548 48 L 538 38" className="branch__twig" />
      </g>
    </svg>
  );
}

function Hero({
  name,
  setName,
  material,
  setMaterial,
}: {
  name: string;
  setName: (v: string) => void;
  material: Material;
  setMaterial: (m: Material) => void;
}) {
  // Re-mounting the hanger restarts the swing: once on load, then on each change.
  const [swing, setSwing] = useState(0);
  const typing = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(typing.current);
    typing.current = setTimeout(() => setSwing((s) => s + 1), 350);
  }, [name]);
  useEffect(() => setSwing((s) => s + 1), [material]);

  const tier = tierByMaterial(material);

  return (
    <section className="hero">
      <div className="hero__sun" aria-hidden="true" />
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="hero__where">Regulated forests in Lithuania</p>
          <h1 className="hero__title">
            <span className="hero__big">Leave something behind.</span>
            <span className="hero__small">Plant a tree with your name on it.</span>
          </h1>
          <p className="hero__lede">
            Most of us want to support the green course but have no land or chance to plant. We
            plant it for you, tag it with your name, and AI keeps you updated as it grows.
          </p>
          <div className="hero__actions">
            <a className="btn btn--sun" href="#tags">
              Plant my tree
            </a>
            <a className="btn btn--outline" href="#updates">
              See a sample update
            </a>
          </div>
        </div>

        <div className="studio">
          <Branch />
          <div className="studio__hang">
            <div className="hanger" key={swing}>
              <span className="hanger__twine" aria-hidden="true" />
              <Tag name={name} material={material} />
            </div>
          </div>
          <Stamp className="studio__stamp" />

          <div className="studio__card">
            <label className="field">
              <span className="field__label">Try your name</span>
              <input
                className="field__input"
                type="text"
                value={name}
                maxLength={28}
                placeholder="e.g. Ona Petraitė"
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <fieldset className="materials">
              <legend className="field__label">Tag</legend>
              {tiers.map((t) => (
                <label key={t.id} className="material" data-material={t.material}>
                  <input
                    type="radio"
                    name="material"
                    value={t.material}
                    checked={material === t.material}
                    onChange={() => setMaterial(t.material)}
                  />
                  <span className="swatch" aria-hidden="true" />
                  {t.materialLabel}
                </label>
              ))}
            </fieldset>
            <ChooseButton
              tier={tier}
              label={`Plant this tree for €${tier.price}`}
              className="btn btn--ink btn--block"
            />
            <p className="studio__note">You confirm the name at checkout.</p>
          </div>
        </div>
      </div>
      <Forest />
    </section>
  );
}

// Deterministic pseudo-random, so the forest is the same on every render.
// Rounded because Math.sin can differ in the last bit between Node and the browser,
// which would make the server and client SVG paths mismatch on hydration.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.round((x - Math.floor(x)) * 1e6) / 1e6;
}

// A pine as three soft, slightly drooping tiers of branches.
function pine(x: number, base: number, h: number) {
  const w = h * 0.46;
  const tiers = [0, 0.27, 0.5].map((t, i) => {
    const top = base - h + h * t;
    const th = h * 0.44;
    const bottom = top + th;
    const half = (w / 2) * (0.58 + i * 0.22);
    const f = (n: number) => n.toFixed(1);
    return (
      `M${f(x)} ${f(top)}` +
      `C${f(x + half * 0.2)} ${f(top + th * 0.4)} ${f(x + half * 0.7)} ${f(top + th * 0.78)} ${f(x + half)} ${f(bottom)}` +
      `Q${f(x)} ${f(bottom - th * 0.16)} ${f(x - half)} ${f(bottom)}` +
      `C${f(x - half * 0.7)} ${f(top + th * 0.78)} ${f(x - half * 0.2)} ${f(top + th * 0.4)} ${f(x)} ${f(top)}Z`
    );
  });
  return `${tiers.join(" ")} M${(x - 2.5).toFixed(1)} ${(base - h * 0.1).toFixed(1)} h5 V${base + 12} h-5Z`;
}

function Forest() {
  const back: string[] = [];
  const front: string[] = [];
  const birches: { x: number; h: number }[] = [];
  for (let i = 0; i < 46; i++) {
    const x = i * 33 + rand(i) * 20;
    back.push(pine(x, 206, 90 + rand(i + 100) * 70));
  }
  for (let i = 0; i < 30; i++) {
    const x = i * 52 + rand(i + 300) * 30;
    if (i % 5 === 2) birches.push({ x, h: 120 + rand(i + 400) * 36 });
    else front.push(pine(x, 216, 70 + rand(i + 200) * 80));
  }
  return (
    <svg className="forest" viewBox="0 0 1560 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d={back.join(" ")} className="forest__back" />
      {birches.map((b, i) => (
        <g key={i}>
          <rect x={b.x - 4} y={216 - b.h + 20} width="8" height={b.h} rx="4" className="forest__birch" />
          {[0.4, 0.55, 0.7, 0.84].map((t) => (
            <rect key={t} x={b.x - 4} y={216 - b.h + b.h * t} width={3 + ((t * 10) % 3)} height="2.5" rx="1" className="forest__mark" />
          ))}
          <ellipse cx={b.x - 4} cy={216 - b.h + 14} rx={24} ry={30} className="forest__crown" />
          <ellipse cx={b.x + 14} cy={216 - b.h + 36} rx={18} ry={22} className="forest__crown forest__crown--light" />
        </g>
      ))}
      <path d={front.join(" ")} className="forest__front" />
      <path d="M0 204 C 300 197, 600 207, 900 199 S 1400 196, 1560 200 V260 H0Z" className="forest__ground" />
    </svg>
  );
}

const packetCopy: Record<Material, { contents: string; tilt: string; no: string }> = {
  plain: { contents: "One native tree and a printed aluminium name tag.", tilt: "-1.6deg", no: "01" },
  wood: { contents: "One native tree and an engraved wooden name tag.", tilt: "0.8deg", no: "02" },
  metal: { contents: "One native tree and an engraved metal tag that lasts decades.", tilt: "-0.6deg", no: "03" },
};

// 26 teeth, 14 units wide, overlapping the paper by 1 unit.
const TEETH = `M0 11 ${Array.from({ length: 26 }, (_, i) => `L${i * 14 + 7} 0 L${i * 14 + 14} 10`).join(" ")} V11Z`;

function Packets({ name }: { name: string }) {
  return (
    <section className="packets" id="tags">
      <div className="wrap">
        <div className="packets__head">
          <h2 className="section-title">Pick your tag</h2>
          <p className="packets__sub">
            Every packet is one real tree, planted and photographed by our team. If it dies, we
            replace it.
          </p>
        </div>
        <div className="packets__row">
          {tiers.map((t) => (
            <Packet key={t.id} tier={t} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Packet({ tier, name }: { tier: Tier; name: string }) {
  const price = tier.price;
  const copy = packetCopy[tier.material];

  return (
    <article className={`packet packet--${tier.material}`} style={{ "--tilt": copy.tilt } as React.CSSProperties}>
      <div className="packet__paper">
        <svg className="packet__teeth" viewBox="0 0 364 10" preserveAspectRatio="none" aria-hidden="true">
          <path d={TEETH} />
        </svg>
        <div className="packet__top">
          <span>Leave a Tree</span>
          <span>No. {copy.no}</span>
        </div>
        <h3 className="packet__name">{tier.name}</h3>
        <div className="packet__window">
          <Tag name={name} material={tier.material} size="sm" />
          <p className="packet__price" aria-label={`${price} euros`}>
            <span>€</span>
            {price}
          </p>
        </div>
        <p className="packet__contents">{copy.contents}</p>
        {tier.popular && <span className="packet__ribbon">Most popular</span>}
      </div>
      <div className="packet__buy">
        <ChooseButton
          tier={tier}
          label={`Choose ${tier.name}`}
          className={`btn btn--block ${tier.popular ? "btn--sun" : "btn--paper"}`}
        />
      </div>
    </article>
  );
}

const steps = [
  {
    title: "Choose your tag",
    text: "Your name, a child's name, or someone you want to remember.",
    art: "tag",
  },
  {
    title: "We plant it in Lithuania",
    text: "In a regulated forest, agreed with local authorities. You get the first photo the day it goes in the ground.",
    art: "plant",
  },
  {
    title: "AI tracks your tree",
    text: "From each season's photo, AI checks growth and health and writes you a personal update.",
    art: "scan",
  },
  {
    title: "If it dies, we replace it",
    text: "Young trees don't always make it. When one doesn't, we plant a new one under the same name.",
    art: "replace",
  },
] as const;

// A two-leaf sprout, shared by the planting, tracking and replacing icons.
function Sprout() {
  return (
    <g>
      <path d="M80 84 V58" className="art__line" />
      <path d="M80 68 C 70 66, 63 59, 63 49 C 73 50, 80 57, 80 68Z" className="art__leaf" />
      <path d="M80 62 C 90 60, 97 53, 97 43 C 87 44, 80 51, 80 62Z" className="art__leaf" />
    </g>
  );
}

function StepArt({ kind }: { kind: (typeof steps)[number]["art"] }) {
  return (
    <svg viewBox="0 0 160 116" className="art" aria-hidden="true">
      <circle cx="80" cy="58" r="50" className="art__disc" />
      {kind === "tag" && (
        <g>
          <path d="M80 12 V44" className="art__twine" />
          <rect x="50" y="36" width="60" height="42" rx="8" className="art__wood" />
          <circle cx="80" cy="46" r="4" className="art__hole" />
          <path d="M64 59 H96 M69 68 H91" className="art__line" />
        </g>
      )}
      {kind === "plant" && (
        <g>
          <path d="M56 84 Q 80 74, 104 84Z" className="art__soil" />
          <path d="M44 84 H116" className="art__line" />
          <Sprout />
        </g>
      )}
      {kind === "scan" && (
        <g>
          <Sprout />
          <path
            d="M48 40 V30 H58 M102 30 H112 V40 M112 76 V86 H102 M58 86 H48 V76"
            className="art__line"
          />
        </g>
      )}
      {kind === "replace" && (
        <g>
          <Sprout />
          <path d="M98 26.8 A 36 36 0 1 1 62 26.8" className="art__line" />
          <path d="M57.5 34.6 L62 26.8 L53 26.8" className="art__line" />
        </g>
      )}
    </svg>
  );
}

function Steps() {
  return (
    <section className="steps" id="how">
      <div className="wrap">
        <h2 className="section-title">How it works</h2>
        <ol className="steps__list">
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <StepArt kind={s.art} />
              <span className="step__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const PROMPT = `You get a photo of a young tree with a name tag, planted in a Lithuanian forest.
Buyer name: {name}. Species: {species}. Planted: {date}. Previous height: {cm}.
1. Estimate the current height and say if the tree looks healthy.
2. Write a warm update to the buyer, max 60 words, in English.
3. If something looks wrong (damage, dry leaves, missing tag), flag it for the team instead of writing the update.`;

function Updates({ name }: { name: string }) {
  const full = name.trim() || "Ona Petraitė";
  const first = full.split(/\s+/)[0];
  return (
    <section className="updates" id="updates">
      <div className="wrap updates__grid">
        <div className="updates__copy">
          <p className="updates__price">
            €{subscription.monthly} a month or €{subscription.yearly} a year
          </p>
          <h2 className="section-title">Watch your tree grow, season by season.</h2>
          <p className="updates__text">
            Every season we photograph your tree. AI measures growth, checks health and writes a
            personal note to you. Our team checks every update before it goes out.
          </p>
          <div className="updates__actions">
            <PayButton linkKey="monthly" label={`€${subscription.monthly} a month`} className="btn btn--ink" />
            <PayButton linkKey="yearly" label={`€${subscription.yearly} a year`} className="btn btn--outline" />
          </div>
          <p className="updates__fine">
            Yearly saves €{subscription.monthly * 12 - subscription.yearly}. Cancel any time.
          </p>
          <details className="prompt">
            <summary>How the AI writes your update</summary>
            <p>We send each season's photo to a vision model with this prompt. A person reads every update before it goes out.</p>
            <pre>{PROMPT}</pre>
          </details>
        </div>

        <div className="postcard" aria-label="Sample update">
          <div className="postcard__front">
            <TreePhoto />
            <span className="postcard__caption">Sample update, spring 2027</span>
          </div>
          <div className="postcard__back">
            <div className="postcard__message">
              <p className="postcard__note">
                {first}, your oak made it through its first Lithuanian winter. New leaves opened last
                week and it grew 12 cm since autumn. The tag is clean and easy to read. We'll visit
                again in summer.
              </p>
              <dl className="postcard__stats">
                <div>
                  <dt>Height</dt>
                  <dd>46 cm</dd>
                </div>
                <div>
                  <dt>Since autumn</dt>
                  <dd>+12 cm</dd>
                </div>
                <div>
                  <dt>Health</dt>
                  <dd>Good</dd>
                </div>
              </dl>
            </div>
            <div className="postcard__side">
              <div className="postcard__stamp" aria-hidden="true">
                <svg viewBox="0 0 60 72">
                  <rect width="60" height="72" className="pstamp__bg" />
                  <circle cx="44" cy="20" r="9" className="pstamp__sun" />
                  <path d="M30 62 l-14 0 14 -36 14 36z" className="pstamp__tree" />
                  <path d="M0 62 H60 V72 H0Z" className="pstamp__ground" />
                </svg>
              </div>
              <svg className="postcard__postmark" viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <path id="pm-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
                </defs>
                <circle cx="60" cy="60" r="56" />
                <circle cx="60" cy="60" r="34" />
                <text>
                  <textPath href="#pm-ring" textLength="270">
                    Checked by our team · Lithuania ·
                  </textPath>
                </text>
                <text x="60" y="66" textAnchor="middle" className="postcard__pm-date">
                  2027
                </text>
              </svg>
              <div className="postcard__to">
                <span>{full}</span>
                <span>Written by AI from this season's photo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// A pointed leaf growing from (x, y), `len` long, pointing at `deg` (0 = right, -90 = up).
function leaf(x: number, y: number, len: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const ux = Math.cos(r);
  const uy = Math.sin(r);
  const w = len * 0.38;
  const at = (along: number, side: number) =>
    `${(x + ux * along - uy * side).toFixed(1)} ${(y + uy * along + ux * side).toFixed(1)}`;
  return (
    `M${at(0, 0)}C${at(len * 0.25, w)} ${at(len * 0.7, w)} ${at(len, 0)}` +
    `C${at(len * 0.7, -w)} ${at(len * 0.25, -w)} ${at(0, 0)}Z`
  );
}

const photoLeaves = {
  dark: [
    leaf(206, 168, 24, 200),
    leaf(206, 168, 22, 245),
    leaf(256, 150, 24, -20),
    leaf(256, 150, 22, -65),
    leaf(231, 118, 24, -90),
    leaf(217, 132, 20, 225),
  ],
  light: [leaf(206, 168, 20, 160), leaf(256, 150, 20, 20), leaf(231, 122, 20, -50), leaf(231, 122, 20, -130)],
};

// Illustration standing in for the seasonal photo, with what the AI reads from it.
// Kept above y≈230: the postcard back covers the bottom of the photo.
function TreePhoto() {
  return (
    <svg className="photo" viewBox="0 0 480 300" role="img" aria-label="Young oak with its name tag. AI notes: 46 cm, plus 12 cm since autumn, tag readable.">
      <rect width="480" height="300" className="photo__sky" />
      <circle cx="404" cy="62" r="30" className="photo__sun" />
      <path d="M0 176 C 90 156, 170 166, 240 160 S 390 150, 480 164 V300 H0Z" className="photo__hill" />
      <path
        d={[pine(46, 172, 74), pine(84, 170, 52), pine(420, 160, 82), pine(456, 164, 56)].join(" ")}
        className="photo__pines"
      />
      <path d="M0 226 C 120 214, 230 222, 320 216 S 440 212, 480 218 V300 H0Z" className="photo__ground" />
      <path d="M210 228 Q 231 218, 252 228Z" className="photo__soil" />

      <path d="M226 228 C 228 196, 229 160, 230.5 118 L 232 118 C 233 160, 235 196, 236 228Z" className="photo__trunk" />
      <path d="M230 182 C 222 176, 214 172, 206 168 M232 162 C 240 158, 248 154, 256 150 M231 140 C 227 136, 222 134, 217 132" className="photo__twig" />
      <path d={photoLeaves.dark.join(" ")} className="photo__leaf" />
      <path d={photoLeaves.light.join(" ")} className="photo__leaf-light" />

      <path d="M228 196 H237 L 246 203" className="photo__twine" />
      <g transform="rotate(6 258 210)">
        <rect x="243" y="201" width="32" height="19" rx="3" className="photo__tag" />
        <circle cx="247" cy="205" r="1.6" className="photo__tag-hole" />
        <path d="M251 211 H269 M254 215 H266" className="photo__tag-text" />
      </g>

      <g className="photo__notes">
        <path d="M300 118 V226 M294 118 H306 M294 226 H306" />
        <text x="316" y="160">46 cm</text>
        <text x="316" y="178" className="photo__note-small">+12 cm since autumn</text>
        <text x="316" y="196" className="photo__note-small">Tag readable</text>
      </g>
    </svg>
  );
}

function Team() {
  return (
    <section className="team" id="team">
      <div className="wrap">
        <div className="team__head">
          <h2 className="section-title">Who plants your tree</h2>
          <p className="team__sub">Dream Team · Tomorrow University</p>
        </div>
        <ul className="team__row">
          {team.map((m, i) => (
            <li key={m.name} className="member" style={{ "--tilt": `${i % 2 ? 1.5 : -1.5}deg` } as React.CSSProperties}>
              <div className="member__photo">
                {m.photo ? (
                  // Plain <img>: the site is a static export without image optimisation.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} width={480} height={480} loading="lazy" />
                ) : (
                  <span className="member__initials" aria-hidden="true">
                    {m.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                )}
              </div>
              <p className="member__name">{m.name}</p>
              {m.role && <p className="member__role">{m.role}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Ledger() {
  const items = [
    { value: ledger.treesPlanted, label: "trees planted" },
    { value: ledger.eurRaised, label: "euros raised from buyers" },
    { value: ledger.subscribers, label: "growth subscribers" },
    { value: ledger.seedTrees, label: "trees from seed money" },
  ];
  return (
    <section className="ledger" id="ledger">
      <div className="wrap">
        <h2 className="ledger__title">Round 1, so far</h2>
        <ul className="ledger__row">
          {items.map((it) => (
            <li key={it.label} className="ledger__item">
              <span className="ledger__value">{it.value}</span>
              <span className="ledger__label">{it.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <p className="footer__mark">Leave a Tree</p>
          <p className="footer__line">Planted in regulated forests in Lithuania, with local authorities.</p>
          <p className="footer__line">Dream Team · Tomorrow University</p>
        </div>
        <Stamp className="footer__stamp" />
        <div className="footer__colophon">
          <p>
            The headline is set in Climate Crisis, a typeface that melts with each year of global
            warming. Here it plays backwards.
          </p>
        </div>
      </div>
    </footer>
  );
}
