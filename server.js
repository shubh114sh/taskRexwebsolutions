var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
var User = require('./model/user');

const db = "mongodb://localhost:27017/task";
mongoose
.connect(db, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
})
.then(() => {
  console.log("Connected To Mongo Db DataBase");
})
.catch((err) => {
  console.log("DataBase Connection Error " + err);
})

var app = express();
app.set('port', 9000);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};

app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/signup.html');
    })
    .post((req, res) => {

        const credentials = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        let check = false;
        credentials.save(function(err,room){
            if(err){
                check = false;
                
            }else{
               check = true;
            }
        })
        if(check){
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        }else{
            res.redirect('/signup');
        }
        
    });


app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;
        User.findOne({ username: username } ).then(function (user) {
            if(user._id != undefined){
                res.redirect('/login');
            }else if(user.password != password){
                res.redirect('/login');
            }else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }         
        });
    });

app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        console.log("logged in");
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        console.log("not logged in");
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});

app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));
