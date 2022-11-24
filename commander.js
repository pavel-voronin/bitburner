class Blueprint {
  name;
  short;
  long;
  required = false;
  type = "bool";

  constructor(opts) {
    Object.assign(this, opts);
  }

  static fromName(name) {
    return new this({
      name,
      short: `-${name[0]}`,
      long: `--${name}`,
    });
  }
}

/** @param {NS} ns */
export default function (ns) {
  function parseFrom(blueprint) {
    if (blueprint.from.match(/^\w+$/)) {
      blueprint.name = blueprint.name ?? blueprint.from;
      blueprint.short = blueprint.short ?? `-${blueprint.name[0]}`;
      blueprint.long = blueprint.long ?? `--${blueprint.name}`;
      blueprint.required = blueprint.required ?? false;
      blueprint.type = blueprint.type ?? "bool";
    } else {
      const FQ = blueprint.from.match(
        /^(?<short>-\w)?(?:(?:,\s*)?(?<long>--\w+))?(?:\s+(?<required>[<\[])(?<type>number|string|bool)(?:[>\]]))?$/
      );

      if (FQ === null) {
        ns.tprint("Something wrong with format. Try this: -q, -query <bool>");
        ns.exit();
      }

      const { short, long, required, type } = FQ.groups;

      if (short === undefined && long === undefined) {
        ns.tprint("Short or long are required");
        ns.exit();
      }

      blueprint.short = blueprint.short ?? short ?? long.substring(1, 3);
      blueprint.long = long;

      if (!("name" in blueprint)) {
        blueprint.name = long ? long.substring(2) : short.substring(1);
      }

      blueprint.required = blueprint.required ?? required === "<";
      blueprint.type = blueprint.type ?? type;
    }
  }

  function normalizeSchema(schema) {
    const normalizedSchema = [];

    for (let input of schema) {
      let blueprint = {};

      if (typeof input === "string") {
        blueprint.from = input;
      } else {
        blueprint = { ...input };
      }

      if ("from" in blueprint) {
        parseFrom(blueprint);
        blueprint.from = undefined;
      }

      if (blueprint.short === undefined && blueprint.long === undefined) {
        ns.tprint("Short or long are required");
        ns.exit();
      }

      blueprint.short = blueprint.short ?? blueprint.long.substring(1, 3);
      blueprint.name =
        blueprint.name ??
        (blueprint.long
          ? blueprint.long.substring(2)
          : blueprint.short.substring(1));
      blueprint.long = blueprint.long ?? `--${blueprint.name}`;
      blueprint.required = blueprint.required ?? false;
      blueprint.type = blueprint.type ?? "bool";

      if (normalizedSchema.some((v) => v.short === blueprint.short)) {
        ns.tprint(`Option ${blueprint.short} was already registered`);
        ns.exit();
      }

      normalizedSchema.push(blueprint);
    }

    return normalizedSchema;
  }

  function parseValue(blueprint, value) {
    switch (blueprint.type) {
      case "bool": {
        if ([undefined, 1, "true", true].includes(value)) {
          return true;
        } else if ([0, "false", false].includes(value)) {
          return false;
        } else {
          ns.tprint(`Wrong bool value: ${value}`);
          ns.exit();
        }
        break;
      }
      case "number": {
        if (value + 0 === value) {
          return value + 0;
        } else {
          ns.tprint(`Wrong number value: ${value}`);
          ns.exit();
        }
        break;
      }
    }
  }

  return function (schema) {
    let args = [...ns.args]; // we are not allowed to mutate ns.args

    const result = {};

    schema = normalizeSchema(schema);

    const requiredOptions = schema
      .filter((v) => v.required)
      .reduce((acc, v) => ({ ...acc, [v.name]: true }), {});

    for (const blueprint of schema) {
      const index = args.findIndex((v) =>
        [blueprint.short, blueprint.long].includes(v)
      );

      let value;

      if (index !== -1) {
        value = args[index + 1];

        if (schema.some((v) => [v.short, v.long].includes(value))) {
          value = undefined;
        }

        result[blueprint.name] = parseValue(blueprint, value);
        requiredOptions[blueprint.name] = undefined;
        args.splice(index, value === undefined ? 1 : 2);
      } else if (blueprint.required) {
        ns.tprint(`${blueprint.name} is required`);
      }
    }

    if (Object.keys(requiredOptions).length > 0) {
      ns.tprint(
        `Specify required options: ${Object.keys(requiredOptions).join(", ")}`
      );
      ns.exit();
    }

    result.args = args;

    ns.tprint(Blueprint.fromName("interactive"));

    return result;
  };
}
