
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var AritcleProvider = require('./articleprovider-mongodb.js').ArticleProvider;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var articleProvider = new ArticleProvider('localhost', 27017);

// app.get('/', routes.index);
// app.get('/users', user.list);

// show all records
app.get('/', function(req, res) {
    articleProvider.findAll(function(error, docs) {
        res.render('index', {
            title: 'Blog',
            articles:docs
        });
    })
})

// show new post page
app.get('/blog/new', function(req, res) {
    res.render('blog_new', {
        title: 'New Post'
    });
});

// post new post
app.post('/blog/new', function(req, res) {
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function(error, docs) {
        res.redirect('/')
    })
});

// show single article to allow comments
app.get('/blog/:id', function(req, res) {
    articleProvider.findById(req.params.id, function(error, article) {
        res.render('blog_show', {
            title: article.title,
            article: article
        });
    })
})

// add comment to article
app.post('/blog/addComment', function(req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
    }, function(error, docs) {
        res.redirect('/blog/'+req.param('_id'))
    })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
