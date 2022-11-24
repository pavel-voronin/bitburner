import { Servers } from "./servers.js";

// Find new servers to hack and hack them

/** @param {NS} ns */
async function backdoor(ns, host) {
  const servers = new Servers(ns).find().items;

  const server = servers.find(({ hostname }) => hostname === host);

  if (server === undefined) {
    ns.tprint(`Unknown server ${host}`);
    ns.exit();
  }

  for (const part of server.path) {
    ns.singularity.connect(part);
  }

  await ns.installBackdoor();
  ns.tprint("Backdoor installed");
}

/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length > 1) {
    ns.tprint(`Usage: run ${ns.getScriptName()} [host]`);
    ns.exit();
  }

  if (ns.args.length === 1) {
    await backdoor(ns, ns.args[0]);
    ns.exit();
  }

  const serversRepository = new Servers(ns);

  const ownServers = serversRepository.find().admin().noBackdoor().items;

  ownServers.forEach(async ({ hostname }) => {
    await backdoor(ns, hostname);
  });
}
