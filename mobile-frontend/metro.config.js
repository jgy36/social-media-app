const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add json to asset extensions if not already there
config.resolver.assetExts.push("json");

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: false,
});
