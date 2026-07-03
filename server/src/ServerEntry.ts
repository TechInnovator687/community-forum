import { createApp } from "./CreateApp";
import { env } from "./config/env";

const app = createApp();

app.listen(env.SERVER_PORT);

console.log("Server listening on", `http://localhost:${String(env.SERVER_PORT)}`);
