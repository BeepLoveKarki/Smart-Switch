let db=require('../models/model');
let misc=require('./misc');
let bcrypt=require('bcryptjs');
let scheduler=require('node-schedule');
let mqtt=require('mqtt');
let request=require('request');
let wifi=require('node-wifi');
let client=mqtt.connect("mqtt://broker.hivemq.com");
let pubtopic="Krishna";
let subtopic="Biplab";
let json={},email,date,m="";
let job=new Array();
let type=new Array();
let switchname=new Array();
let i=0;
let n=false,o;
      
client.on("connect",()=>{
    client.subscribe(subtopic);
});

client.on("message",(topic,message)=>{
   if(topic==subtopic) {
        m=message.toString();
    }
});

wifi.init({
  iface:null
});

module.exports.controller=function(app) {

   app.get('/',(req,res)=>{
        res.send("OK");
   });
   
    app.post('/addswitch', (req, res) => {
        json["switches"]=req.body.switches;
        json["email"]=req.body.email;
        db.addswitch(json,res);
    });
    app.post ('/getswitch',(req,res)=>{
      db.getswitch(res,req.body.email);
    });
    app.post('/login',(req,res)=>{
       misc.checkit(req,res,req.body);
    });
    app.post('/addnewuser',(req,res)=>{
       misc.hashit(res,req.body);
    });
    app.post('/switchandg',(req,res)=>{
        db.switchandg(res,req.body);
    });

    /*app.post('/mqtts',(req,res)=>{
      url="mqtt://"+req.body.values["url"];
      pubtopic=req.body.values["pubtop"];
      subtopic=req.body.values["subtop"];

      res.send(JSON.stringify("Done"));
      
      request.post('/a',{host:req.body.values["url"],pubtop:req.body.values["pubtop"],subtop:req.body.values["subtop"]},(err,response,body)=>{
        if(err) res.send(JSON.stringify("Error"));
        res.send(JSON.stringify("Done"));
      });
    });*/

    /*app.get('/wifi',(req,res)=>{
      //wifi list from arduino
    });*/
    app.get('/wifi',(req,res)=>{
     wifi.scan((err,networks)=>{
        if(err) res.send(JSON.stringify("Error"));
        let ssids=new Array();
        let securitys=new Array();
        for(let i=0;i<networks.length;i++){
            ssids.push(networks[i].ssid);
            securitys.push(networks[i].security);
        }
        res.send(JSON.stringify({ssids:ssids,securitys:securitys}));
      });
    });

    app.post('/checkifin',(req,res)=>{
        db.checkifin(req.body["group"],req.body["name"],req.body["email"],res);
    });

    app.get('/makeit',(req,res)=>{
      db.insertnow(res);
    });
    
    app.post('/checkexist',(req,res)=>{
     email=req.body.email;
     db.checkemail(req.body.email,res,0);
    });
    
    app.post('/resetpass',(req,res)=>{
     misc.passupdate(email,req.body.pass,res);
    });

    app.post('/group',(req,res)=>{
        db.addgroup(req.body,res);
    });

    app.post('/repostgroup',(req,res)=>{
        db.addgroup(req.body,res);
    });

    app.post('/clicked',(req,res)=>{
        //console.log("Button is "+req.body["button"]+" and group is "+req.body["group"]+" state is "+req.body["state"]);
        if(req.body["via"]==false) client.publish(pubtopic,req.body["button"]);
        res.end(JSON.stringify("Done"));
    });

    app.post('/schedule',(req,res)=>{
        date=new Date(req.body["date"]);
        /*if(req.body["group"]==undefined){
           console.log("The type is "+req.body["type"]+" and group name is " +req.body["name"]);
        }else{
            console.log("The type is "+req.body["type"]+" ,group name is "+req.body["group"]+" and the switch name is "+req.body["name"]);
        }*/
        job.push(scheduler.scheduleJob(date,function(){
            client.publish(pubtopic,req.body["name"]);
        }));
        res.end(JSON.stringify("Done"));
    });

    app.get('/getstat',(req,res)=>{
        if(m!=""){
            res.send(JSON.stringify(m));
            m="";
        }else{
            res.send(JSON.stringify("old"));
        }
    });

}
