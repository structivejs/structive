import { bootstrapStructive, config } from "../../structive.esm.min.js";

config.autoLoadFromImportMap = true;
config.enableMainWrapper = false;
config.enableRouter = false;
config.shadowDomMode = "none";
config.debug = true;
bootstrapStructive();
