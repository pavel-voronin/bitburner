/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("disableLog");
  ns.disableLog("sleep");
  ns.disableLog("getServerUsedRam");

  while (1) {
    const servers = ns.getPurchasedServers();

    for (const server of servers) {
      const usedRam = ns.getServerUsedRam(server);

      if (usedRam !== 0) {
        continue;
      }

      ns.run("run.js", 1, server, "weaken.js", "joesguns");
    }

    await ns.sleep(100);
  }
}
