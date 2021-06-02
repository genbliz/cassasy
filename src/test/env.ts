require("dotenv").config();
//
const envGlobCache: { [x: string]: string } = {};

/**
 * cache value, its faster!
 *
 * @param {string} envKey
 * @returns
 */
function getEnv(envKey: string) {
  if (envGlobCache[envKey] !== undefined) {
    return envGlobCache[envKey];
  }
  const envVal = process.env[envKey];
  console.log({ current: { envKey, envVal }, envGlobCache });
  if (envVal !== undefined) {
    envGlobCache[envKey] = envVal;
    return envVal;
  }
  return undefined;
}

function getEnvString(envKey: string) {
  const val = getEnv(envKey);
  if (val) {
    return val;
  }
  return "";
}

// function getEnvBool(envKey: string) {
//   const val = getEnv(envKey);
//   if (val !== undefined && Boolean(val) === true) {
//     return true;
//   }
//   return false;
// }

function getEnvNumber(envKey: string, defaultVal?: number) {
  const val = getEnv(envKey);
  if (val !== undefined && !isNaN(Number(val))) {
    return Number(val);
  }
  return defaultVal as number;
}

export const envConfig = {
  NODE_ENV: () => getEnvString("NODE_ENV") as "production" | "development" | "test",
  //
  APP_PORT: () => getEnvNumber("APP_PORT"),
  //
  CASSANDRA_USERNAME: () => getEnvString("CASSANDRA_USERNAME"),
  CASSANDRA_PASSWORD: () => getEnvString("CASSANDRA_PASSWORD"),
  CASSANDRA_HOST: () => getEnvString("CASSANDRA_HOST"),
  CASSANDRA_REGION: () => getEnvString("CASSANDRA_REGION"),
  CASSANDRA_PORT: () => getEnvNumber("CASSANDRA_PORT"),
  CASSANDRA_CA: () => getEnvString("CASSANDRA_CA"),
} as const;
