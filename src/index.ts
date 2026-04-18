import "dotenv/config";
import { app } from "./app";
import { env } from "./config/env";

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Your express server is listening at port:${PORT}`);
});
