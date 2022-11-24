/** @param {NS} ns */
const missionTor = async (ns) => {
  const player = ns.getPlayer();

  if (player.tor === true) {
    ns.tprint("Player already has TOR");
    return;
  }

  while (1) {
    if (player.money > 200_000) {
      ns.singularity.purchaseTor();
      ns.tprint("Player has successfully bought the TOR");
      return;
    }

    await ns.sleep(500);
  }
};

/** @param {NS} ns */
export async function main(ns) {
  const missions = [{ name: "Buy TOR", f: missionTor }];

  for (const mission of missions) {
    ns.tprint(`Mission: ${mission.name}`);
    await mission.f(ns, mission);
    ns.tprint("-----------------");
  }
}
