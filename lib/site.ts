// Everything the team needs to edit lives in this file.

// Paste your Stripe Payment Links (or PayPal links) here.
// In Stripe, give each tier link a required custom text field "Name on the tag",
// and set the success URL to https://<your-site>/thanks/?tier=<tier-id>
// (subscriptions: /thanks/?plan=monthly or /thanks/?plan=yearly).
// Leave a gift link empty to hide the gift option on that tier.
export const paymentLinks = {
  seedling: "",
  heritage: "",
  legacy: "",

  seedlingGift: "",
  heritageGift: "",
  legacyGift: "",

  monthly: "",
  yearly: "",
};

export type Material = "plain" | "wood" | "metal";
export type TierId = "seedling" | "heritage" | "legacy";

export type Tier = {
  id: TierId;
  name: string;
  material: Material;
  materialLabel: string;
  price: number;
  blurb: string;
  popular?: boolean;
};

export const tiers: Tier[] = [
  {
    id: "seedling",
    name: "Seedling",
    material: "plain",
    materialLabel: "Plain",
    price: 15,
    blurb: "A native tree with a printed aluminium name tag.",
  },
  {
    id: "heritage",
    name: "Heritage",
    material: "wood",
    materialLabel: "Wood",
    price: 35,
    blurb: "A native tree with an engraved wooden tag.",
    popular: true,
  },
  {
    id: "legacy",
    name: "Legacy",
    material: "metal",
    materialLabel: "Metal",
    price: 65,
    blurb: "A native tree with an engraved metal tag that lasts decades.",
  },
];

export const GIFT_PRICE = 5;
export const subscription = { monthly: 3, yearly: 29 };
export const PLANTING_YEAR = 2026;

export const tierByMaterial = (m: Material) => tiers.find((t) => t.material === m)!;
export const tierById = (id: string | null) => tiers.find((t) => t.id === id);

// Round 1 numbers for the ledger section. Update these by hand as orders come in.
export const ledger = {
  treesPlanted: 1,
  eurRaised: 5,
  subscribers: 0,
  seedTrees: 1, // saplings paid for with the seed money
};

export const SPONSOR = "Tomorrow University";

// The live site's address, used for social share previews. Set NEXT_PUBLIC_SITE_URL when
// deploying to your own domain; on Vercel the production URL is picked up automatically.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// The team section. Photos live in public/team/ (square, ~480px). Leave photo empty to
// show initials; leave role empty to hide it.
export const team = [
  { name: "Jesse Schwenk", role: "", photo: "/team/jesse.webp" },
  { name: "Povilas Kepalavicius", role: "", photo: "/team/povilas.webp" },
  { name: "Isabella Caminos", role: "", photo: "/team/isabella.webp" },
];
