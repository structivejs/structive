import { bootstrapStructive, config } from "../../structive.esm.min.js";

config.autoLoadFromImportMap = true;
config.enableMainWrapper = false;
config.enableRouter = false;
config.locale = "de";
config.debug = true;
bootstrapStructive();
