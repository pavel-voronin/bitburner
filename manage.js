import { Servers } from "./servers.js";

const State = {
  IDLE: "idle",
  HACK: "hack",
  WEAKEN: "weaken",
  GROW: "grow",
};

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("disableLog");
  ns.disableLog("sleep");

  const jobs = {};

  const calculateThreads = (host, script) => {
    const freeRAM = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
    const scriptRunCost = ns.getScriptRam(script);

    const threads = Math.floor(freeRAM / scriptRunCost);

    return threads;
  };

  const changeState = (host, state, target) => {
    if (jobs[host].state === state) {
      return;
    }

    const script = `${state}.js`;

    ns.killall(host);
    const threads = calculateThreads(host, script);
    ns.scp(script, host);
    ns.exec(script, host, threads, target);

    ns.print(`[${host}:${target}] ${jobs[host].state} -> ${state}`);

    jobs[host].state = state;
  };

  const chooseTarget = () => {
    const servers = new Servers(ns).find().admin().hasMoney().items;

    servers.sort((a, b) => {
      const calc = (server) =>
        (ns.hackAnalyze(server.hostname) *
          ns.hackAnalyzeChance(server.hostname) *
          server.moneyAvailable) /
        ns.getHackTime(server.hostname);

      return calc(b) - calc(a);
    });

    return servers[0].hostname;
  };

  const now = () => Math.floor(Date.now() / 1000);

  const addJob = (server) => {
    const target = chooseTarget();

    jobs[server.hostname] = {
      target,
      state: State.IDLE,
      created: now(),
      updateWhen: now() + Math.floor(ns.getHackTime(target) / 1000) + 1,
    };
  };

  const updateJobs = () => {
    const servers =
      // .notOwn()
      new Servers(ns).find().admin().hasCPU().items;

    for (const server of servers) {
      if (server.hostname in jobs) {
        if (now() >= jobs[server.hostname].updateWhen) {
          jobs[server.hostname] = undefined;
        } else {
          continue;
        }
      }

      addJob(server);
    }
  };

  while (1) {
    updateJobs();

    for (const host in jobs) {
      const target = jobs[host].target;

      // var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
      // var securityThresh = ns.getServerBaseSecurityLevel(target) + 5;

      // if (ns.getServerSecurityLevel(target) > securityThresh) {
      // 	changeState(host, State.WEAKEN, target)
      // } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      // 	changeState(host, State.GROW, target)
      // } else {
      changeState(host, State.HACK, target);
      // }
    }

    await ns.sleep(1000);
  }
}
