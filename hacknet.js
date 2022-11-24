// import initParser from './commander'

const TICKS_PER_SEC = 2;

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("disableLog");
  ns.disableLog("sleep");

  // const parser = initParser(ns)

  // let { balance, investments } = parser([
  // 	"-b, --balance [number]",
  // 	"-i, --investments [number]"
  // ])

  let { b: balance, i: investments } = ns.flags([
    ["b", 0],
    ["i", 0],
  ]);

  investments = investments ?? 0;
  balance = balance ?? 0;

  ns.print(
    `Started with balance = ${balance} and every second ${
      investments > 0 ? "deposit" : "withdrawal"
    } = ${investments}`
  );

  while (1) {
    const numNodes = ns.hacknet.numNodes();

    const upgradeCandidates = [];

    balance += investments / TICKS_PER_SEC;

    for (let i = 0; i < numNodes; i++) {
      const node = ns.hacknet.getNodeStats(i);

      balance += node.production / TICKS_PER_SEC;

      upgradeCandidates.push([ns.hacknet.getRamUpgradeCost(i, 1), i, "ram"]);
      upgradeCandidates.push([
        ns.hacknet.getLevelUpgradeCost(i, 1),
        i,
        "level",
      ]);
      upgradeCandidates.push([ns.hacknet.getCoreUpgradeCost(i, 1), i, "core"]);
    }

    upgradeCandidates.push([ns.hacknet.getPurchaseNodeCost(), 0, "node"]);

    upgradeCandidates.sort((a, b) => {
      return a[0] - b[0];
    });

    const upgrade = upgradeCandidates[0];

    if (balance > upgrade[0]) {
      switch (upgrade[2]) {
        case "ram": {
          ns.hacknet.upgradeRam(upgrade[1]);
          break;
        }
        case "level": {
          ns.hacknet.upgradeLevel(upgrade[1]);
          break;
        }
        case "core": {
          ns.hacknet.upgradeCore(upgrade[1]);
          break;
        }
        case "node": {
          ns.hacknet.purchaseNode();
          break;
        }
      }

      balance -= upgrade[0];
      ns.print(`new ${upgrade[2]}. Balance = ${balance}`);
    }

    await ns.sleep(1000 / TICKS_PER_SEC);
  }
}
