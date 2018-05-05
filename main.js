let cors = require('cors');
let express=require('express');
let parser=require('body-parser');
let fs=require('fs');
let path=require('path');
let route=require('./controllers/controller');
let model=require('./models/model');
let app=new express();

app.use(parser.json());
app.use(parser.urlencoded({extended:true}));
app.use(cors({origin:'*'}));

route.controller(app);
app.listen(process.env.PORT || 8080);
