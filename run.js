/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length < 2) {
    ns.print(`Usage: run ${ns.getScriptName()} <host> <script> [...args]`);
    ns.exit();
  }

  const host = ns.args[0];
  const script = ns.args[1];
  const args = ns.args.slice(2);

  const freeRAM = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
  const scriptRunCost = ns.getScriptRam(script);

  const threads = Math.floor(freeRAM / scriptRunCost);

  ns.print(`Copying ${script} to host ${host}...`);
  ns.scp(script, host);

  ns.print(`Running ${script} on host ${host} with ${threads} threads...`);
  ns.exec(script, host, threads, ...args);
}
