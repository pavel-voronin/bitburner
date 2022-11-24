import { Servers } from "./servers.js";

// Find new servers to hack and hack them

/** @param {NS} ns */
export async function main(ns) {
  const {
    b: f_backdoor,
    B: f_no_backdoor,
    i: f_idle,
    o: f_own,
  } = ns.flags([
    ["b", false],
    ["B", false],
    ["i", false],
    ["o", false],
  ]);

  const query = new Servers(ns).find().admin();

  if (f_no_backdoor) {
    query.noBackdoor();
  }

  if (f_backdoor) {
    query.backdoor();
  }

  if (f_idle) {
    query.idle();
  }

  if (f_own) {
    query.own();
  }

  const ownServers = query.items;

  ownServers.forEach(({ hostname }) => {
    ns.tprint(`${hostname}`);
  });
}
