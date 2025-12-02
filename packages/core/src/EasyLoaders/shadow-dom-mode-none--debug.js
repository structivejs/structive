import { bootstrapStructive, config } from "../structive.esm.js";

config.autoLoadFromImportMap = true;
config.shadowDomMode = "none";
config.debug = true;
bootstrapStructive();
