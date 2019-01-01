'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var gulpNgConfig = require('gulp-ng-config');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*','gulp-rev','gulp-rev-rewrite','main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials',gulp.series(function () {
  return gulp.src([
    path.join(conf.paths.src, '/app/**/*.html'),
    path.join(conf.paths.tmp, '/serve/app/**/*.html')
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'BlurAdmin',
      root: 'app'
    }))
    .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
}));

gulp.task('html', gulp.series('inject', 'partials', function () {
  var partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, '/partials'),
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html', { restore: true, dot:true});
  var jsFilter = $.filter('**/*.js', { restore: true, dot:true});
  var cssFilter = $.filter('**/*.css', { restore: true, dot:true});
  var assets;

  return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.sourcemaps.init())
    .pipe($.ngAnnotate())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.sourcemaps.init())
    .pipe($.replace('../../bower_components/bootstrap-sass/assets/fonts/bootstrap/', '../fonts/'))
    .pipe($.minifyCss({ processImport: false }))
    .pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revRewrite())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true,
      conditionals: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
}));

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts',gulp.series( function () {
  return gulp.src($.mainBowerFiles('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
}));

gulp.task('other',gulp.series('copyVendorImages', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });

  return gulp.src([
    path.join(conf.paths.src, '/**/*'),
    path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss,md}'),
    path.join(conf.paths.tmp, '/serve/**/assets/img/theme/vendor/**/*')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
}));

gulp.task('clean',gulp.series( function () {
  return $.del([path.join(conf.paths.dist, '/*'), path.join(conf.paths.tmp, '/*')]);
}));

gulp.task('localEnv', gulp.series(function () {
  gulp.src('./src/app/config/configFile.json')
      .pipe(gulpNgConfig('BlurAdmin.config',{environment: 'local'}))
      .pipe(gulp.dest('./src/app/config/'))
}));

gulp.task('stagingEnv', gulp.series(function () {
  gulp.src('./src/app/config/configFile.json')
      .pipe(gulpNgConfig('BlurAdmin.config',{environment: 'staging'}))
      .pipe(gulp.dest('./src/app/config/'))
}));

gulp.task('productionEnv',gulp.series( function () {
  gulp.src('./src/app/config/configFile.json')
      .pipe(gulpNgConfig('BlurAdmin.config',{environment: 'production'}))
      .pipe(gulp.dest('./src/app/config/'))
}));

gulp.task('placeholderEnv',gulp.series( function () {
  gulp.src('./src/app/config/configFile.json')
      .pipe(gulpNgConfig('BlurAdmin.config',{environment: 'placeholder'}))
      .pipe(gulp.dest('./src/app/config/'))
}));

gulp.task('build',gulp.series('productionEnv','html', 'fonts', 'other'));

gulp.task('build:staging',gulp.series('stagingEnv','html', 'fonts', 'other'));
gulp.task('build:local', gulp.series('localEnv','html', 'fonts', 'other'));
gulp.task('build:production', gulp.series('productionEnv','html', 'fonts', 'other'));
gulp.task('build:placeholder',gulp.series('placeholderEnv','html', 'fonts', 'other'));
