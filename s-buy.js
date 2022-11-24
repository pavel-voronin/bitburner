/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("disableLog");
  ns.disableLog("getServerMaxRam");
  ns.disableLog("sleep");

  const getServerUpgradeCost = (server) => {
    const ram = ns.getServerMaxRam(server);
    const level = Math.log2(ram);

    if (level === 20) {
      return null;
    }

    const nextLevel = level + 1;

    const cost = ns.getPurchasedServerCost(Math.pow(2, nextLevel));

    return cost;
  };

  do {
    await ns.sleep(100);

    // collect

    let candidates = [];

    const purchasedServers = ns.getPurchasedServers();

    if (purchasedServers.length < ns.getPurchasedServerLimit()) {
      for (let i = 20; i >= 1; i--) {
        const cost = ns.getPurchasedServerCost(Math.pow(2, i));
        candidates.push(["buyServer", cost, i]);
      }
    }

    for (const server of purchasedServers) {
      const cost = getServerUpgradeCost(server);

      if (cost !== null) {
        candidates.push(["upgradeServer", cost, server]);
      }
    }

    if (candidates.length === 0) {
      ns.print("Everything is maxed out");
      ns.exit();
    }

    // filter

    const money = ns.getPlayer().money;
    candidates = candidates.filter((v) => v[1] < money);

    // choose

    candidates.sort((a, b) => b[1] - a[1]);

    if (candidates.length === 0) {
      continue;
    }

    ns.print({ candidates });

    const chosen = candidates[0];

    // perform

    let name;
    let level;
    let cost;

    switch (chosen[0]) {
      case "buyServer": {
        level = chosen[2];
        name = ns.purchaseServer("p", Math.pow(2, level));
        cost = ns.getPurchasedServerCost(Math.pow(2, level));
        ns.print(`Server ${name} bought for ${cost}`);
        break;
      }

      case "upgradeServer": {
        name = chosen[2];
        level = Math.log2(ns.getServerMaxRam(name));
        ns.killall(name);
        ns.deleteServer(name);
        ns.print(`Server ${name} was deleted`);

        cost = ns.getPurchasedServerCost(Math.pow(2, level + 1));
        name = ns.purchaseServer("p", Math.pow(2, level + 1));
        if (name) {
          ns.print(`Server ${name} bought for ${cost}`);
        }
        break;
      }
    }
  } while (1);
}
