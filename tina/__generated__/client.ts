import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'C:/antigravity/statichtmlpro/fdrefs/tina/__generated__/.cache/1785055106828', url: 'http://localhost:4001/graphql', token: 'null', queries,  });
export default client;
  