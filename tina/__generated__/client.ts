import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: 'C:/antigravity/statichtmlpro/fdrefs/tina/__generated__/.cache/1782892669867', url: 'http://localhost:4001/graphql', token: '1234567890abcdef1234567890abcdef', queries,  });
export default client;
  