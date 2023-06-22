import { JsonDB, Config } from "node-json-db";

const config = new Config("./db/db.json", true, true, "/");
const db = new JsonDB(config);

export default db;
