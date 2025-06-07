import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

const external = ['react', 'react-dom'];

const plugins = [
  postcss({
    plugins: [
      tailwindcss(),
      autoprefixer()
    ],
    extract: 'styles.css',
    minimize: true
  }),
  resolve({
    browser: true,
    preferBuiltins: false,
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }),
  commonjs(),
  babel({
    exclude: 'node_modules/**',
    presets: ['@babel/preset-env', '@babel/preset-react'],
    babelHelpers: 'bundled'
  })
];

export default [
  // React/ES Module build
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    external,
    plugins
  },
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    external,
    plugins
  },
  // UMD build for browser/CDN
  {
    input: 'src/index.js',
    output: {
      exports: 'named',
      file: 'dist/vonage-video-meeting.umd.js',
      format: 'umd',
      name: 'VonageVideoMeeting',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      },
      sourcemap: true
    },
    external,
    plugins: [...plugins, terser()]
  },
  // Standalone build (includes React)
  {
    input: 'src/standalone.js',
    output: {
      exports: 'named',
      file: 'dist/vonage-video-meeting.standalone.js',
      format: 'iife',
      name: 'VonageVideoMeeting',
      sourcemap: true
    },
    plugins: [
      postcss({
        plugins: [
          tailwindcss(),
          autoprefixer()
        ],
        inject: true
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env', '@babel/preset-react'],
        babelHelpers: 'bundled'
      }),
      terser()
    ]
  }
];