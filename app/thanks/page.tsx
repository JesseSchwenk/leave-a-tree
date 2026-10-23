"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import Tag from "@/components/Tag";
import { tierById, type Material } from "@/lib/site";

type Order =
  | { kind: "tree"; tierName: string; material: Material; gift: boolean; name: string }
  | { kind: "updates"; plan: string };

export default function Thanks() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan) {
      setOrder({ kind: "updates", plan: plan === "yearly" ? "yearly" : "monthly" });
      return;
    }
    let name = "";
    let saved: Material = "wood";
    try {
      name = sessionStorage.getItem("lat:name") ?? "";
      saved = (sessionStorage.getItem("lat:material") as Material) ?? "wood";
    } catch {}
    const tier = tierById(params.get("tier"));
    setOrder({
      kind: "tree",
      tierName: tier?.name ?? "",
      material: tier?.material ?? saved,
      gift: params.get("gift") === "1",
      name,
    });
  }, []);

  return (
    <>
      <header className="header">
        <div className="wrap header__inner">
          <Logo />
        </div>
      </header>
      <main className="thanks">
        <div className="hero__sun" aria-hidden="true" />
        <div className="wrap thanks__inner">
          {order?.kind === "updates" ? (
            <>
              <h1 className="thanks__title">Growth updates are on.</h1>
              <p className="thanks__text">
                Your {order.plan} plan is active. Your first update arrives after our next seasonal
                photo round, with your tree's height, health and a note written from the photo.
              </p>
            </>
          ) : (
            <>
              {order && (
                <div className="thanks__tag">
                  <Tag name={order.name} material={order.material} />
                </div>
              )}
              <h1 className="thanks__title">Your tree is on its way.</h1>
              <p className="thanks__text">
                Payment received{order?.tierName ? ` for ${order.tierName}` : ""}.{" "}
                {order?.gift
                  ? "We email the gift card to the recipient, plant the tree in our next planting round"
                  : "We plant your tree in our next planting round"}{" "}
                and send the first photo the day it goes in the ground. Your receipt is in your inbox.
              </p>
            </>
          )}
          <div className="thanks__actions">
            {order?.kind === "tree" && (
              <a className="btn btn--ink" href="/#updates">
                Add growth updates
              </a>
            )}
            <a className="btn btn--outline" href="/">
              Back to Leave a Tree
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
