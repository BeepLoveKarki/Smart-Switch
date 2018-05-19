let db=require('../models/model');
let bcrypt=require('bcryptjs');
let datas;

function hashit(res,data){
   delete data["cpassword"];
   datas=data;
   addit(res);
}

function addit(res){
  bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(datas["password"],salt,(err,hash)=>{
         datas["password"]=hash;
         db.insertif(res,datas);
      });
   });
}

function checkit(req,res,data){ 
    db.checkif(res,data,(result)=>{
        if(result=="No"){
            res.send(JSON.stringify("No"));
         }else{
             checkpass(data,result,req,res);
         }
     });
}

function checkpass(p1,p2,req,res){
    bcrypt.compare(p1["password"], p2,(err, val)=> {
        if(val==true){
            res.send(JSON.stringify("Yes"));
         }else{
            res.send(JSON.stringify("No"));
         }
    });
}

function passupdate(email,password,res){
    bcrypt.genSalt(10,(err,hash)=>{
      bcrypt.hash(password,hash,(err,value)=>{ 
        db.updateit(email,value,res);
      })
    });
}

function wifimanage(a,name,res){
    let wifiname=new Array();
    let wifistrength=new Array();
    let wifitype=new Array();
    a.forEach((elem) => {
        let r=elem.substring(0,elem.indexOf("(")).slice(0,-1);
        wifiname.push(r);
        elem=elem.replace(r,"");
        let t=elem.substring(elem.indexOf("(")+1,elem.indexOf(")"));
        wifistrength.push(t);
        elem=elem.replace(t,"").replace(/[\(\)]/g,"").trimLeft();
        wifitype.push(elem);
    });
    let final={wifis:wifiname,strength:wifistrength,type:wifitype};
    db.addarduinowifi(final,name,res);
}

module.exports={
    hashit:hashit,
    checkit:checkit,
    passupdate:passupdate,
    addit:addit,
    wifimanage:wifimanage
}