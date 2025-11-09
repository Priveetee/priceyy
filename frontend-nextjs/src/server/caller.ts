import { appRouter } from "./routers/_app";

export const serverTrpc = appRouter.createCaller({});
