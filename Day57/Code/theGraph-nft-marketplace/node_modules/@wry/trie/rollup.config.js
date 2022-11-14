import typescriptPlugin from 'rollup-plugin-typescript2';
import typescript from 'typescript';

const globals = {
  __proto__: null,
  tslib: "tslib",
};

function external(id) {
  return id in globals;
}

export default [{
  input: "src/trie.ts",
  external,
  output: {
    file: "lib/trie.esm.js",
    format: "esm",
    sourcemap: true,
    globals,
  },
  plugins: [
    typescriptPlugin({
      typescript,
      tsconfig: "./tsconfig.rollup.json",
    }),
  ],
}, {
  input: "lib/trie.esm.js",
  external,
  output: {
    // Intentionally overwrite the trie.js file written by tsc:
    file: "lib/trie.js",
    format: "cjs",
    exports: "named",
    sourcemap: true,
    name: "trie",
    globals,
  },
}];
