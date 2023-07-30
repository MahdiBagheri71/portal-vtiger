const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig(__dirname);

    return {
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer'),
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: false,
                },
            }),
        },
        resolver: {
            assetExts: assetExts.filter((ext) => ext !== 'svg'),
            sourceExts: [...sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'],
            extraNodeModules: new Proxy(
                {},
                {
                    get: (_, name) => path.join(process.cwd(), `node_modules/${name}`),
                }
            ),
        },
    };
})();
