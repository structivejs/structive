import { bootstrapStructive, config } from "structive";

config.autoLoadFromImportMap = true;
config.enableMainWrapper = false;
config.enableRouter = false;
config.shadowDomMode = "none";
config.locale = "ja";
config.debug = true;
bootstrapStructive();
