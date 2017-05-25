// REQUIRE PACKAGES
// For Gulp
let gulp = require('gulp')
let runSequence = require('run-sequence')
let clean = require('gulp-clean')
let browserSync = require('browser-sync').create()
let strip = require('gulp-strip-comments')
let stripDebug = require('gulp-config-strip-debug')
let noop = require('gulp-noop')

// For Css
let sass = require('gulp-sass')
let sourcemaps = require('gulp-sourcemaps')
let autoprefixer = require('gulp-autoprefixer')

// For Js
let babel = require("gulp-babel")
let uglify = require("gulp-uglify")
let concat = require("gulp-concat")

// For Json
let jsonminify = require('gulp-jsonminify')

// For Images
let imagemin = require('gulp-imagemin')

// Define I/O paths
let path = {
	css: {
		i: './src/scss/**/*.scss',
		o: './public/css/'
	},
	html: {
		i: './src/**/*.html',
		o: './public/'
	},
	js: {
		i: './src/js/**/*.js',
		o: './public/js'
	},
	images: {
		i: './src/images/**/*',
		o: './public/images'
	},
	data: {
		i: './src/data/**/*.json',
		o: './public/data'
	},
	pages: {
		i: './src/pages/**/*',
		o: './public/pages'
	},
    txt: {
        i: './src/*.txt',
		o: './public'
    }
}

// Define options
let sassOptions = {
	errLogToConsole: true,
	outputStyle: 'expanded'
}

let autoprefixerOptions = {
	browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
}

let envProd = false

// TASKS

gulp.task('default', function(callback) {
	sassOptions = {
		errLogToConsole: true,
		outputStyle: 'expanded'
	}
	envProd = false
	runSequence('clean:public', 'sass', 'html', 'js', 'images', 'data', 'pages', 'txt', callback)
})

// Watching for changes
gulp.task('watch', function(callback) {
	runSequence('clean:public', 'default', function() {
		browserSync.init({
			server: "public"
		})
		gulp.watch(path.js.i, ['js', browserSync.reload])
		gulp.watch(path.css.i, ['sass', browserSync.reload])
		gulp.watch(path.html.i, ['html', browserSync.reload])
		gulp.watch(path.images.i, ['images', browserSync.reload])
		gulp.watch(path.data.i, ['data', browserSync.reload])
		gulp.watch(path.pages.i, ['pages', browserSync.reload])
	})
})

// Bundle everything up ready for dropping onto the server
// Destroy comments, remove console.logging, minify
gulp.task('production', function(callback) {
	console.log('production build started')
	sassOptions = {
		errLogToConsole: false,
		outputStyle: 'compressed'
	}
	envProd = true
	runSequence('clean:public', 'sass', 'html', 'js', 'images', 'data', 'pages', 'txt', () => {
		console.log('production build finished')
	})
})

// Delete the publicribution folder
gulp.task('clean:public', function() {
	return gulp.src('./public', {
			read: false
		})
		.pipe(clean())
})

// HTML files
gulp.task('html', function() {
	gulp.src([path.html.i])
		// Perform minification tasks, etc here
		.pipe(gulp.dest(path.html.o))
})

// Images
gulp.task('images', function() {
	gulp.src([path.images.i])
		.pipe((envProd) ? imagemin({
			progressive: true
		}) : noop())
		.pipe(gulp.dest(path.images.o))
})

// Data files
gulp.task('data', function() {
	gulp.src([path.data.i])
		.pipe((envProd) ? jsonminify() : noop())
		.pipe(gulp.dest(path.data.o))
})

// 3rd party plugins
gulp.task('pages', function() {
	gulp.src([path.pages.i])
		.pipe(gulp.dest(path.pages.o))
})

// .txt files (Robots and Hhumans)
gulp.task('txt', function() {
	gulp.src([path.txt.i])
		// Perform minification tasks, etc here
		.pipe(gulp.dest(path.txt.o))
})

// Scss
gulp.task('sass', function() {
	return gulp.src(path.css.i)
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(autoprefixer((envProd) ? autoprefixerOptions : noop()))
		.pipe(gulp.dest(path.css.o))
})

// Javascript
gulp.task('js', function() {
	gulp.src(path.js.i)
		.pipe(sourcemaps.init())
		.pipe(concat('app.js'))
		.pipe(babel({
			presets: ['es2015'],
			minified: envProd
		}))
		.pipe((envProd) ? stripDebug() : noop())
		.pipe((envProd) ? strip() : noop())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(path.js.o))
})
