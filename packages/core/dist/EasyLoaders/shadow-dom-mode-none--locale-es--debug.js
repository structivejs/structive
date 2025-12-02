import { bootstrapStructive, config } from "../structive.esm.js";

config.autoLoadFromImportMap = true;
config.shadowDomMode = "none";
config.locale = "es";
config.debug = true;
bootstrapStructive();
