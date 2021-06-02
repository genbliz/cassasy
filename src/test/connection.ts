import { envConfig } from "./env";
import cassandra from "cassandra-driver";

class CassandraConnactionBase {
  private readonly client: cassandra.Client;

  constructor() {
    const username = envConfig.CASSANDRA_USERNAME();
    const password = envConfig.CASSANDRA_PASSWORD();
    const host = envConfig.CASSANDRA_HOST();
    const region = envConfig.CASSANDRA_REGION();
    const port = envConfig.CASSANDRA_PORT();
    //
    // const certificate = fs.readFileSync(resolve("temp/AmazonRootCA1.pem"), "utf-8");
    const certificate = envConfig.CASSANDRA_CA();

    const sslOptions = {
      ca: [certificate],
      host: host,
      rejectUnauthorized: true,
    };

    const authProvider = new cassandra.auth.PlainTextAuthProvider(username, password);
    this.client = new cassandra.Client({
      authProvider,
      sslOptions,
      contactPoints: [host],
      localDataCenter: region,
      protocolOptions: { port },
      profiles: [
        new cassandra.ExecutionProfile("my-x-profile", {
          consistency: cassandra.types.consistencies.one,
          readTimeout: 10000,
        }),
        new cassandra.ExecutionProfile("default", {
          consistency: cassandra.types.consistencies.localQuorum,
        }),
      ],
    });
  }

  getClient() {
    return this.client;
  }
}

export const CassandraConnection = new CassandraConnactionBase();
