// Learn more: https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The backend in /server is not part of the website bundle. Keep Metro from crawling it
// (its node_modules also trips over OneDrive placeholder files on Windows).
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const serverDir = new RegExp(`^${escape(path.join(__dirname, 'server'))}[\\\\/].*`);

const existing = config.resolver.blockList;
config.resolver.blockList = [...(Array.isArray(existing) ? existing : existing ? [existing] : []), serverDir];

module.exports = config;
