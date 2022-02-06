const { src, dest, watch, series } = require('gulp');

const sass = require('gulp-dart-sass');

const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const htmlmin = require('gulp-htmlmin');
const shell = require('gulp-shell')
const autoprefixer = require('autoprefixer')
const browsersync = require('browser-sync').create();
const del = require('del');

/* style(s) & script(s) file/folder paths ;) */
const paths = {
  styles: {
    src: 'src/scss/**/*.scss',
    srcCss: 'src/css/',
    srcHtml: 'src/**/*.htm*',
    srcFolder: 'src/',
    dest: 'dist/css/',
    destFolder: 'dist/'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/'
  }
};


// Sass Task
function scssTask() {
  return src(paths.styles.src, { sourcemaps: true })
    .pipe(sass())
    .pipe(sass().on('error', sass.logError))
    
    .pipe(postcss([ autoprefixer() ]))
    .pipe(dest(paths.styles.srcCss))
    
    .pipe(postcss([ cssnano()] ))
    .pipe(dest(paths.styles.dest, { sourcemaps: '.' }))
}

// JavaScript Task
function jsTask() {
  return src(paths.scripts.src, { sourcemaps: true })
    .pipe(terser())
    .pipe(dest(paths.scripts.dest, { sourcemaps: '.' }));
}

// Task to minify HTML
function minihtmlTask() {
  return src(paths.styles.srcHtml)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.styles.destFolder));
}

// Clean Dist & Sub Folders
function clean(cb) {
  del([paths.styles.destFolder+'*']);
  cb();
}

// Browsersync Tasks
function browsersyncServe(cb) {
  browsersync.init({
    watch: true,
    server: {
      // baseDir: '.'
      // baseDir: 'src/'
      baseDir: ''+paths.styles.srcFolder+''
    }
  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch('*.htm*', browsersyncReload);
  watch([paths.styles.src, paths.scripts.src], series(scssTask, jsTask, browsersyncReload));
}

// Default Gulp task
exports.default = series(
  scssTask,
  jsTask,
  browsersyncServe,
  watchTask
);

/* clean dist folder */
exports.clean = clean;

/* Combines task functions and/or composed operations into larger operations that will be executed one after another, in sequential order. There are no imposed limits on the nesting depth of composed operations using series() and parallel(). */ 
exports.build = series(clean,scssTask,jsTask,minihtmlTask);
