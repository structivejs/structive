import { bootstrapStructive, config } from "structive";

config.autoLoadFromImportMap = true;
config.enableMainWrapper = false;
config.enableRouter = false;
config.shadowDomMode = "none";
config.debug = true;
bootstrapStructive();
