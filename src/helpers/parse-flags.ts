import { runArgs } from "../etl";

// make this better
export const parseFlags = (): runArgs => {
  const args = process.argv.slice(2);
  const flags: runArgs = {
    extract: false,
    transform: false,
    load: false,
  };
  if (args.length === 0 || args.includes("--all")) {
    flags.extract = true;
    flags.transform = true;
    flags.load = true;
    return flags;
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--extract") {
      flags.extract = true;
    } else if (arg === "--transform") {
      flags.transform = true;
    } else if (arg === "--load") {
      flags.load = true;
    }
  }
  return flags;
};
