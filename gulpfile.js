const { src, dest, watch, series } = require('gulp');

const sass = require('gulp-dart-sass');

const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('autoprefixer')
const browsersync = require('browser-sync').create();
const del = require('del');


const paths = {
  styles: {
    src: 'src/scss/**/*.scss',
    dest: 'dist/css/'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/'
  }
};



// Sass Task
function scssTask() {
  return src('src/scss/style.scss', { sourcemaps: true })
    .pipe(sass())
    .pipe(sass().on('error', sass.logError))
    
    .pipe(postcss([ autoprefixer() ]))
    .pipe(dest('src/css/'))
    
    .pipe(postcss([ cssnano()] ))
    .pipe(dest('dist/css/', { sourcemaps: '.' }))
}

// JavaScript Task
function jsTask() {
  return src('src/js/script.js', { sourcemaps: true })
    .pipe(terser())
    .pipe(dest('dist/js/', { sourcemaps: '.' }));
}

// Task to minify HTML
function minihtmlTask() {
  return src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist/'));
}

// Clean Dist & Sub Folders
function clean(cb) {
  del(['dist/*']);
  cb();
}

// Browsersync Tasks
function browsersyncServe(cb) {
  browsersync.init({
    watch: true,
    server: {
      // baseDir: '.'
      baseDir: 'src/'
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
  watch('*.html', browsersyncReload);
  watch(['src/scss/**/*.scss', 'src/js/**/*.js'], series(scssTask, jsTask, browsersyncReload));
}

// Default Gulp task
exports.default = series(
  scssTask,
  jsTask,
  browsersyncServe,
  watchTask
);


exports.clean = clean;


/* Combines task functions and/or composed operations into larger operations that will be executed one after another, in sequential order. There are no imposed limits on the nesting depth of composed operations using series() and parallel(). */ 
exports.build = series(clean,scssTask,jsTask,minihtmlTask);
