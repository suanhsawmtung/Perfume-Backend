import "dotenv/config";
import { env } from "../config/env";
import { app } from "./app";

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Your express server is listening at port:${PORT}`);
});
