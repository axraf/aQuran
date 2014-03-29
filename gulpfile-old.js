
var gulp = require('gulp'),
    clean = require('gulp-clean'),
    gutil = require('gulp-util'),
    _ = require('lodash'),
    fs = require('fs'),
    sqlite3 = require('sqlite3'),
    async = require('async'),
    admZip = require('adm-zip'),
    properties = require('properties'),
    glob = require('glob'),
    rename = require('gulp-rename'),
    jade = require('gulp-jade'),
    less = require('gulp-less'),
    coffee = require('gulp-coffee'),
    cson = require('gulp-cson'),
    download = require('gulp-download'),
    manifest = require('gulp-manifest'),
    jsonEditor = require('gulp-json-editor'),
    // coffeelint = require('gulp-coffeelint'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),
    browserify = require('gulp-browserify'),
    connect = require('connect');

console.log(gutil.env);
/* A helper function */
var copy = function(src, dest, options) {
    return gulp.src(src, options)
    .pipe(gulp.dest(dest));
};

var paths = {
    ionic: 'src/ionic/**/*',
    coffee: ['src/*.coffee', 'src/scripts/**/*.coffee'],
    js: ['src/scripts/*.js'],
    styles: ['src/styles/main.less', 'src/styles/*.css'],
    jade: ['src/index.jade', 'src/views/*.jade'],
    images: 'src/images/*',
    manifest: 'src/manifest.coffee',
    locales: ['src/_locales/**/*.*'],
    resources: ['src/resources/**/*.json', 'src/resources/amiri/**.ttf', 'src/styles/fonts/*', 'src/styles/flags/**/*'],
    translations: 'src/resources/translations/*.trans.zip',
    translations_txt: 'src/resources/translations.txt',
    db: 'src/database/main.db',
    recitations: 'src/resources/recitations.js',
    khaledHosnyTexts: 'src/khaledhosny-quran/quran/*.txt'
};

gulp.task('clean', function() {
    return gulp.src('dist/chrome')
    .pipe(clean());
});

gulp.task('ayas', function(callback) {
    var db = new sqlite3.Database(paths.db, sqlite3.OPEN_READONLY);
    db.all('SELECT * FROM aya ORDER BY `gid`;', function(err, rows) {
        console.log('Found', rows.length, 'rows');
        var current = 0;
        var sura_id = 1;
        var processFile = function(file) {
            console.log('Processing file', file);
            var text = fs.readFileSync(file).toString();
            var numbers_regex = /[٠١٢٣٤٥٦٧٨٩]+/g
            var numbers = text.match(numbers_regex);
            sura_id = Number(file.match(/\d+/g));
            // console.log('Numbers', numbers);
            var regex = /\u06DD|[٠١٢٣٤٥٦٧٨٩]/g;
            text.replace(regex, '').trim().split('\n').forEach(function(line, index) {
                console.log(current, sura_id, line, index);
                try {

                    rows[current].sura_id = sura_id;
                    rows[current].aya_id_display = numbers[index];
                    rows[current].uthmani = line.trim();
                    
                } catch(e) {
                    console.log(e);
                }
                current += 1;
            });
            // console.log(text);
        };
        var files = glob.sync(paths.khaledHosnyTexts);
        // console.log(files);
        files.forEach(processFile);
        // console.log(_.sample(rows));
        fs.writeFile('dist/chrome/resources/ayas.json', JSON.stringify(rows), callback);
    });
});

gulp.task('ayas_search', function(callback) {
    // TODO: read from json file instead
    var db = new sqlite3.Database(paths.db, sqlite3.OPEN_READONLY);
    db.all('SELECT gid, standard, standard_full FROM aya ORDER BY `gid`;', function(err, rows) {
        console.log('Found', rows.length, 'rows');
        fs.writeFile('dist/chrome/resources/ayas_search.json', JSON.stringify(rows), callback);
    });
});


gulp.task('ionic', function() {
    return gulp.src(paths.ionic, { base: 'src' })
    .pipe(gulp.dest('dist/chrome'));
});

gulp.task('styles', function() {
    return gulp.src(paths.styles, { base: 'src/styles' })
    .pipe(less({
        sourceMap: true,
        compress: false
    }))
    .pipe(gulp.dest('dist/chrome/styles'));
});

gulp.task('scripts', function() {
    gulp.src(paths.coffee, { /*read: false,*/ base: 'src' })
    // .pipe(browserify({
    //     transform: ['coffeeify'],
    //     extensions: ['.coffee'],
    //     debug: true
    // }))
    // .pipe(rename(function(file) {
    //     file.extname = '.js';
    // }))
    .pipe(coffee({ bare: true }))
    .pipe(gulp.dest('dist/chrome'));
    
    gulp.src(paths.js, { base: 'src' })
    .pipe(gulp.dest('dist/chrome'))
});
    
gulp.task('html', function() {
    return gulp.src(paths.jade, { base: 'src' })
    .pipe(jade({
        pretty: false,
        locals: {
            scripts:  [
                // 'ionic/js/angular/angular.js',
                // 'ionic/js/angular/angular-resource.js',
                // 'ionic/js/angular/angular-animate.js',
                // 'ionic/js/angular-ui/angular-ui-router.js',
                // 'ionic/js/ionic.js',
                'scripts/idbstore.min.js',
                'scripts/lodash.js',
                // 'scripts/q.js',
                'scripts/async.js',
                'scripts/nedb.js',
                'ionic/js/ionic.bundle.min.js',
                // 'http://code.ionicframework.com/nightly/js/ionic.bundle.min.js',
                'scripts/ngStorage.min.js',
                'ionic/js/angular/angular-sanitize.min.js',
                'scripts/angular-audio-player.min.js',
                'scripts/main.js',
                'scripts/services/cache-service.js',
                'scripts/services/preferences-service.js',
                'scripts/services/localization-service.js',
                'scripts/factories/explanation-factory.js',
                'scripts/factories/audio-src-factory.js',
                'scripts/factories/query-builder.js',
                'scripts/factories/idbstore-factory.js',
                'scripts/services/explanation-service.js',
                'scripts/directives/auto-direction-directive.js',
                'scripts/controllers/aya-controller.js',
                'scripts/controllers/preferences-controller.js',
                'scripts/controllers/recitations-controller.js',
                'scripts/controllers/explanations-controller.js',
                'scripts/controllers/navigation-controller.js',
                'scripts/controllers/search-controller.js',
                'scripts/controllers/reading-controller.js',
                'scripts/directives/emphasize-directive.js',
                'scripts/directives/colorize-directive.js',
                'scripts/services/storage-service.js',
                'scripts/services/arabic-service.js',
                'scripts/filters/arabic-number-filter.js',
                'scripts/services/api-service.js',
                'scripts/services/recitation-service.js',
                'scripts/services/content-service.js',
                'scripts/services/search-service.js'
                ],
            styles: [
                'ionic/css/ionic.min.css',
                // 'http://code.ionicframework.com/nightly/css/ionic.min.css',
                'styles/main.css'
                ]
        }
    })).pipe(gulp.dest('dist/chrome'));
});

gulp.task('images', function() {
    return copy(paths.images, 'dist/chrome/images');
});

gulp.task('manifest', function() {
    // return copy(paths.manifest, 'dist/chrome');
    gulp.src(paths.manifest)
    .pipe(cson())
    .pipe(rename(function(file) {
        file.extname = '.webapp';
        return file;
    }))
    .pipe(gulp.dest('dist/chrome'))
});

gulp.task('cache_manifest', function() {

});

gulp.task('locales', function() {
    return copy(paths.locales, 'dist/chrome', { base: 'src' });
});

gulp.task('res', function() {
    return copy(paths.resources, 'dist/chrome', { base: 'src' });
});

gulp.task('download_translations', function() {
    var text = fs.readFileSync(paths.translations_txt).toString();
    var urls = text.split(/\n/g);
    console.log('Found', urls.length, 'URLs');
    
    var destination = 'src/resources/translations';
    return download(urls)
    .pipe(gulp.dest(destination));

});

gulp.task('download_recitations', function() {
    var url = 'http://www.everyayah.com/data/recitations.js';
    return download(url)
    .pipe(gulp.dest('src/resources'));
});

gulp.task('recitations', function() {
    gulp.src(paths.recitations)
    .pipe(rename(function(file) {
        file.extname = '.json'
    }))
    .pipe(jsonEditor(function(json) {
        // console.log(json);
        delete json.ayahCount;
        json = _.chain(json)
        .each(function(item, key) {
            item.index = key - 1;
            return item;
        })
        .toArray()
        .sortBy('index')
        .each(function(item) {
            delete item.index
            return item;
        })
        .value();
        console.log(json);
        return json;
    })) 
    .pipe(gulp.dest('dist/chrome/resources'));
});

gulp.task('translations', function(callback) {
    var files = glob.sync(paths.translations);
    console.log('Translations files:', files);
    var processFile = function(memo, file, callback) {
        // console.info('memo is:', memo);
        console.log('Processing file', file);
        var zip = new admZip(file);
        var entries = zip.getEntries();
        var props = {};
        async.each(entries, function(entry, callback) {
            if (entry.name.match(/.properties$/gi)) {
                properties.parse(entry.getData().toString('utf-8'), function(err, obj) {
                    props = obj;
                    callback(err);
                });
            } else if (entry.name.match(/.txt$/gi)) {
                zip.extractEntryTo(entry.name, 'dist/chrome/resources/translations', false, true);
                callback();
            }
        }, function(err) {
            memo.push(props)
            callback(err, memo);
        });
    };
    async.reduce(files, [], processFile, function(err, translations) {
        if (err) return console.log('Error:', err.message);
        translations = JSON.stringify(translations);
        console.log('Writing "translations.json"...');
        fs.writeFile('dist/chrome/resources/translations.json', translations, function(err) {
            if (err) console.log('Error writing translations.json:', err.message);
            callback(err);
        });
    });
});

gulp.task('serve', function(callback) {
    var port = 7000;
    connect.createServer(connect.static(__dirname + '/dist/chrome')).listen(port);
});

gulp.task('init', ['ayas', 'ayas_search', 'download_translations', 'download_recitations', 'recitations']);

gulp.task('build', ['manifest', 'res', 'locales', 'ionic', 'scripts', 'html', 'styles', 'images']);

gulp.task('watch', function() {
    // var server = livereload();
    gulp.watch(paths.manifest, ['manifest']);
    gulp.watch(paths.coffee, paths.js, ['scripts', 'html']);
    gulp.watch(paths.jade, ['html']);
    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.resources, ['res']);
    
});

gulp.task('default', ['build', 'watch']);