var debug = require('debug')('Hitick:server');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

// Cookies and Body Parsers
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Session Management
var session = require("express-session")({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
    resave: true,
    saveUninitialized: true
});
var sharedSession = require("express-socket.io-session");

var flash = require("connect-flash");

// Passport Authentication
var passport = require('passport');
var setupPassport = require('./setupPassport');

// Database Module
var mongoose = require('mongoose');

// Routers
var routes = require('./routes/index');
var login = require('./routes/login');
var signup = require('./routes/signup');
var logout = require('./routes/logout');
var create = require('./routes/create');
var join = require('./routes/join');
var group = require('./routes/group');
var poll = require('./routes/poll');
var sessionInfo = require('./routes/session');
//API Router
var api_v1 = require('./api/v1');


var app = express();

/* Get the port and set in express */
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = require("http").createServer(app);

// Socket.IO
var io = require('socket.io').listen(server);

// Firebase Cloud Messaging
var FCM = require("fcm-node");

var serverKey = "AIzaSyCeUI8Ws4WWXBtQLgvcSn7ZHjL3yh9T_Fg";
var fcm = new FCM(serverKey);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the database
mongoose.connect('mongodb://localhost:27017/HitickDb');

//Session Middleware
app.use(session);

io.use(sharedSession(session));

// Setup Passport
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Flash Middleware
app.use(flash());

app.use('/', routes);
app.use('/login', login);
app.use('/signup', signup);
app.use('/logout', logout);
app.use('/create', create);
app.use('/group', group);
app.use('/session', sessionInfo);

//Route for all API requests
app.use('/api/v1', api_v1);

// Inject Socket.IO object in the route handlers
app.use('/poll', poll(io , fcm));
app.use('/join', join(io , fcm));

/*
 * SocketIO group joining, the connected socket will join the group
 * */
io.sockets.on('connection', function (socket) {
    socket.on("Ping", function (message) {
        console.log(message);
    });

    // If the groupId is in session object join the socket to that group
    if (socket.handshake.session.groupId) {
        socket.join(socket.handshake.session.groupId);
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stack traces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

