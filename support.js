import { Servers } from "./servers.js";

/** @param {NS} ns */
export async function main(ns) {
  const chooseTarget = () => {
    const servers = new Servers(ns).find().admin().hasMoney().items;

    return servers.at(~~(Math.random() * servers.length)).hostname;
  };

  while (1) {
    await ns.grow(chooseTarget());
  }
}
