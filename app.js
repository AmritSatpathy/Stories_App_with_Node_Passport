const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const fetch = require('node-fetch');
const redis = require('redis');
const session = require('express-session')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const { Mongoose } = require('mongoose')

//Redis Port
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient(REDIS_PORT);

//Load config

dotenv.config({ path: './config/config.env'})


//passport config
require('./config/passport')(passport)


connectDB()

const app = express()

//body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

//logging
if (process.env.NODE_ENV === 'developement'){
    app.use(morgan('dev'))
}

//Handlebar helper
const {formatDate,stripTags,truncate,editIcon,select } = require('./helpers/hbs')

//handlebars
app.engine('.hbs',exphbs({ helpers: {formatDate,stripTags,truncate,editIcon,select},defaultLayout:'main',extname:'.hbs'}))
app.set('view engine','.hbs')

//session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection})
}))


//passport
app.use(passport.initialize())
app.use(passport.session())

// set global var
app.use(function (req, res,next) {
    res.locals.user = req.user || null
    next()
})


//static
app.use(express.static(path.join(__dirname,'public')))


//routes
app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))
const PORT = process.env.PORT || 3000 

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)