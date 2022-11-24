import { Servers } from "./servers.js";

// Find new servers to hack and hack them

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("disableLog");
  ns.disableLog("getHackingLevel");
  ns.disableLog("sleep");

  ns.print("Looking for new servers to nuke...");

  while (1) {
    const serversRepository = new Servers(ns);

    const currentLevel = ns.getHackingLevel();
    const inventory = {
      brutessh: ns.fileExists("BruteSSH.exe"),
      ftpcrack: ns.fileExists("FTPCrack.exe"),
      relaysmtp: ns.fileExists("relaySMTP.exe"),
      httpworm: ns.fileExists("HTTPWorm.exe"),
      sqlinject: ns.fileExists("SQLInject.exe"),
    };

    const serversToHack = serversRepository
      .find()
      .notAdmin()
      .notOwn()
      .needPortsLTE(Object.values(inventory).filter((v) => v).length)
      .hackSkillLTE(currentLevel)
      .fullyProneTo(inventory).items;

    serversToHack.forEach(({ hostname }) => {
      if (inventory.brutessh) {
        ns.print(`[${hostname}] BruteSSH`);
        ns.brutessh(hostname);
      }

      if (inventory.ftpcrack) {
        ns.print(`[${hostname}] FTPCrack`);
        ns.ftpcrack(hostname);
      }

      if (inventory.relaysmtp) {
        ns.print(`[${hostname}] relaySMTP`);
        ns.relaysmtp(hostname);
      }

      if (inventory.httpworm) {
        ns.print(`[${hostname}] HTTPWorm`);
        ns.httpworm(hostname);
      }

      if (inventory.sqlinject) {
        ns.print(`[${hostname}] SQLInject`);
        ns.sqlinject(hostname);
      }

      ns.print(`[${hostname}] Nuke`);
      ns.nuke(hostname);
    });

    await ns.sleep(1000);
  }
}
