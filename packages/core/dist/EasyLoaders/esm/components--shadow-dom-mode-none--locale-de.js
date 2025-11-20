import { bootstrapStructive, config } from "../../exports.js";

config.autoLoadFromImportMap = true;
config.enableMainWrapper = false;
config.enableRouter = false;
config.shadowDomMode = "none";
config.locale = "de";
bootstrapStructive();
