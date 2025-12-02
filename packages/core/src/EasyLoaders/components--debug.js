import { bootstrapStructive, config } from "../structive.esm.js";

config.autoLoadFromImportMap = true;
config.enableMainWrapper = false;
config.enableRouter = false;
config.debug = true;
bootstrapStructive();
