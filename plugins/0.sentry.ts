import { definePlugin } from "nitro";

import { initSentry } from "../src/integrations/sentry";

export default definePlugin(async () => {
  initSentry();
});
