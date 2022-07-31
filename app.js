const express = require('express')
const app = express()
const path = require('path')
const port = 8080
const crypto = require('crypto')
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const fs = require('fs')
var escapeHtml = require('escape-html')
const cookieParser = require("cookie-parser")
app.use(cookieParser())
const sessions = require('express-session')


var session;
const oneWeek = 1000 * 60 * 60 * 24 * 7;
app.use(sessions({
    secret: "wow health quote",
    saveUninitialized:false,
    cookie: { 
        domain: 'wowhealthinsight.com',
        maxAge: oneWeek,
        secure: false, 
        httpOnly: false,
    },
    resave: false 
}));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

// Deafult page route that will redirect to health route
app.get('/', (req, res) => {
    const token = crypto.randomBytes(5).toString('hex');
    session = req.session;
    // console.log("comppleted steps", req.session.completed_steps);
    if(typeof req.session.completed_steps != 'undefined' && req.session.completed_steps == 11) {
        req.session.userToken = '';
    }

    // console.log("session on load", req.session);
    // console.log("user IP", req.headers['x-forwarded-for']);
    if(typeof req.session.userToken === 'undefined' || req.session.userToken == '') {
        session.userToken = token;
        session.completed_steps = 0;
        session.currPage = 'coverage';
        session.nextPage = 'benefits';
        session.prevPage = '';
        session.userData = {
            coverage: ''
        };
        const fileName = 'data/users.json';
        fs.readFile(fileName, 'utf-8', (err, data) => {
            if (err) throw err
            jsonData = JSON.parse(data)
            if(typeof jsonData[token] === 'undefined') {
                Object.assign(jsonData,  {[token]:{'IP': req.headers['x-forwarded-for'], 'finished': false}});
                fs.writeFile(fileName, JSON.stringify(jsonData, null, 4), function writeJSON(err) {
                    if (err) return console.log(err);
                });
            }
        })
    }
    res.redirect('/health?token='+session.userToken+'#'+req.session.nextPage);
})

// Home page route
app.get('/health', validateQuery(['token']), (req, res) => {
    const token = req.query.token;
    // console.log("token sss", token)
    
    if(!validateToken(token)) {
        
        res.render('pages/index', {
            res: { page: 'home', error: true, msg: 'Page not found.', desc: 'Sorry, something went wrong.'},
            token: req.query.token,
            step: '1',
            title: "WOW - HEALTH INSIGHT",
            data: {}
            
        })
    } else {
        var uData = {
            userToken: req.query.token,
            completed_steps: session.completed_steps,
            currPage: session.currPage,
            nextPage: session.nextPage,
            prevPage: session.prevPage,
            userData: session.userData
        }
        res.render('pages/index', {
            res: { page: 'home', error: false, msg: 'All ok.', desc: 'token is fine'},
            token: req.query.token,
            step: '1',
            title: "WOW - HEALTH INSIGHT",
            data:uData
        })
    }   
})

// Middleware to check token exists or not
function validateQuery(fields) {

    return (req, res, next) => {

        for(const field of fields) {
            if(!req.query[field]) { // Field isn't present, end request
                return res
                    .status(400)
                    .send(`${field} is missing`);
            }
        }

        next(); // All fields are present, proceed

    };

}

// Middleware to check validity 
function validateToken(token) {
    // let jsonData = await readJsonData();
    // const readFileAsync = fs.readFileSync('data/users.json', 'utf8');
    // const jsonData = JSON.parse(readFileAsync);
    if(typeof session === 'undefined') {
        return false;
    }
    else if(typeof session.userToken === 'undefined' )
    {
        return false;
    } else if(session.userToken != token) {
        return false;
    } else {
        return true;
    }

    /*if(typeof jsonData[token] === 'undefined') {
        return false;
    } else {
        return true;
    }*/
   

}



// route for steps
app.post('/step', (req, res) => {
    session = req.session;
    const token = req.session.userToken;
    // console.log("req.session.userToken", req.session.userToken);
    if(!validateToken(token)) {

        res.render('pages/index', {
            res: { page: 'home', error: true, msg: 'Page not found.', desc: 'Sorry, something went wrong.'},
            token: req.session.userToken,
            step: '1',
            title: "WOW - HEALTH INSIGHT",
            data: {}
        })

    } else {

        session.userToken = req.session.userToken;
        session.completed_steps = req.body.completed_steps;
        session.currPage = req.body.currPage;
        session.nextPage = req.body.nextPage;
        session.prevPage = req.body.prevPage;
        Object.assign(session.userData,  req.body.userData);
        
        var uData = {
            userToken: token,
            completed_steps: session.completed_steps,
            currPage: session.currPage,
            nextPage: session.nextPage,
            prevPage: session.prevPage,
            userData: session.userData
        }

        const fileName = 'data/users.json';
        fs.readFile(fileName, 'utf-8', (err, data) => {
            if (err) throw err
            jsonData = JSON.parse(data)
            if(req.body.userData) {
            
                Object.assign(jsonData[token],  req.body.userData);
                if(req.body.completed_steps == 11) {
                    Object.assign(jsonData[token],  {finished: true});
                }

                fs.writeFile(fileName, JSON.stringify(jsonData, null, 4), function writeJSON(err) {
                    if (err) return console.log(err);
                });
            }
        })

        if(session.prevPage) {
            res.render("pages/steps/"+req.body.nextPage, { page: 'home' });
        } else {

            if(session.completed_steps == 1) {
                res.render("pages/steps/"+req.body.nextPage, { page: 'home' });
            } else {
                res.render("pages/steps/"+req.body.currPage, { page: 'home' });
            }
        }
    }
    
})

// route terms-and-conditions
app.get('/terms-and-conditions', (req, res) => {
    res.render('pages/terms-conditions', { data: session, page: 'terms-conditions', title: 'Terms And Conditions' });
})

// route /privacy-policy
app.get('/privacy-policy', (req, res) => {
    res.render('pages/privacy-policy', { data: session, page: 'privacy-policy', title: 'Privacy Policy' });
})

// include assets
app.use(express.static(path.join(__dirname, 'assets')))

// run application
app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
