module.exports = {
    env: {
        commonjs: true,
        es2020: true,
        node: true,
        jest: true,
    },
    extends: ['@zattoo'],
    parserOptions: {
        ecmaVersion: 11,
    },
    plugins: ['jest'],
    rules: {
    },
};
