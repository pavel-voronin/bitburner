class ServersLookup {
  items;

  /** @param {Server[]} items */
  constructor(items) {
    this.items = items;
  }

  admin() {
    this.items = this.items.filter((server) => server.hasAdminRights);
    return this;
  }

  notAdmin() {
    this.items = this.items.filter((server) => !server.hasAdminRights);
    return this;
  }

  hackSkillLTE(level) {
    this.items = this.items.filter(
      (server) => server.requiredHackingSkill <= level
    );
    return this;
  }

  notOwn() {
    this.items = this.items.filter((server) => !server.purchasedByPlayer);
    return this;
  }

  own() {
    this.items = this.items.filter((server) => server.purchasedByPlayer);
    return this;
  }

  needPortsLTE(count) {
    this.items = this.items.filter(
      (server) => server.numOpenPortsRequired <= count
    );
    return this;
  }

  fullyProneTo(inventory) {
    const { brutessh, ftpcrack } = inventory;
    const inventorySize = Object.values(inventory).filter((v) => v).length;

    this.items = this.items
      .filter((server) => server.numOpenPortsRequired <= inventorySize)
      .filter((server) => !server.sshPortOpen || brutessh)
      .filter((server) => !server.ftpPortOpen || ftpcrack)
      .filter((server) => !server.httpPortOpen)
      .filter((server) => !server.smtpPortOpen)
      .filter((server) => !server.sqlPortOpen);

    return this;
  }

  hasMoney() {
    this.items = this.items.filter((server) => server.moneyAvailable > 0);
    return this;
  }

  noBackdoor() {
    this.items = this.items.filter((server) => !server.backdoorInstalled);
    return this;
  }

  backdoor() {
    this.items = this.items.filter((server) => server.backdoorInstalled);
    return this;
  }

  hasCPU() {
    this.items = this.items.filter((server) => server.maxRam > 0);
    return this;
  }

  idle() {
    this.items = this.items.filter((server) => server.ramUsed === 0);
    return this;
  }
}

export class Servers {
  ns;

  /** @param {NS} _ns */
  constructor(_ns) {
    this.ns = _ns;

    this.ns.disableLog("disableLog");
    this.ns.disableLog("enableLog");
    this.ns.disableLog("scan");
  }

  getAllServerNamesWithPaths(host, path = [host]) {
    let results = this.ns.scan(host, true);

    results = results
      .filter((v) => !path.includes(v))
      .map((v) => path.concat(v));

    for (let h of results) {
      results = results.concat(this.getAllServerNamesWithPaths(h.at(-1), h));
    }

    return results;
  }

  find() {
    const names = this.getAllServerNamesWithPaths("home");

    const servers = names.map((path) => this.ns.getServer(path.at(-1)));
    servers.forEach((v) => {
      v.path = names.find((q) => q.at(-1) === v.hostname);
    });

    return new ServersLookup(servers);
  }
}
