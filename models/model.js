let MongoClient=require('mongodb').MongoClient;
let url="mongodb://beeplove:Meriaama12@ds113200.mlab.com:13200/users";
//let url="mongodb://127.0.0.1:27017/";
let nodemailer=require('nodemailer');
let datas,wifiname;

let transporter=nodemailer.createTransport({
   service:'gmail',
   auth:{
      user:'beeplovekarki@gmail.com',
      pass:'realmanbiplab'
   }
});

let getwifiname=()=>wifiname;

function insertif (res,data){
    MongoClient.connect(url,(err,db)=>{
        let dbase=db.db("users");
        dbase.collection("clients").findOne({email:data["email"]},(err,result)=>{
            if(result==null){
               datas=data;
               sendemail(data["email"],res,1);
            }else{
                res.send(JSON.stringify("Already"));
            }
        });
     });
}

function insertnow(res){
 MongoClient.connect(url,(err,db)=>{
    let dbase=db.db("users");
    insert(dbase,db,datas,res);
 });
}

function insert(dbase,db,data,res){
    dbase.collection("clients").insertOne(data,(err,result)=>{
        db.close();
        res.send(JSON.stringify("Done"));
    });
}

function checkif(res,data,callback){
    MongoClient.connect(url,(err,db)=>{
        let dbase=db.db("users");
        dbase.collection("clients").findOne({email:data["email"]},(err,result)=>{
            db.close();
            if(result==null){
               callback("No");
            }else{
                callback(result.password);
            }
        });
     });
}

function addswitch(data,res){
    MongoClient.connect(url,(err,db)=>{
      let dbase=db.db("users");
      dbase.collection("clients").findOne({email:data["email"]},(err,result)=>{
          dbase.collection("clients").update({"_id":result._id},{$set:{"switches":data["switches"]}},(err,results)=>{
             db.close();
			 if(results.result.nModified!=0){
                 res.send(JSON.stringify("Added"));
             }
          })
      });
    });
}

function getswitch(res,email){
    MongoClient.connect(url,(err,db)=>{
      let dbase=db.db("users");
      dbase.collection("clients").findOne({email:email},(err,result)=>{
        db.close();
        res.send(JSON.stringify([result.switches,JSON.stringify(result.group)]));
      });
    });
}

function checkemail(email,res,value){
    MongoClient.connect(url,(err,db)=>{
        let dbase=db.db("users");
        dbase.collection("clients").findOne({email:email},(err,result)=>{
          db.close();
          if(result==null){
              res.send(JSON.stringify("no"));
          }else{
            sendemail(email,res,value);
          }
        });
    });
}

function sendemail(email,res,val){
    let code=Math.floor(Math.random()*(100000-10000)+10000);
    let mailoptions;
    if(val==0){
    mailoptions={
     from:'biplabkarki04@gmail.com',
     to:email,
     subject:'Password reset email',
     html:'<p>The password reset code is <b>'+code+'</b> .Please enter it carefully in the app.'
   };
  }else{
    mailoptions={
        from:'biplabkarki04@gmail.com',
        to:email,
        subject:'Email confirmation code',
        html:'<p>The email confirmation code is <b>'+code+'</b> .Please enter it carefully in the app.'
      };
  }
   transporter.sendMail(mailoptions,(err,info)=>{
      res.send(JSON.stringify(code));
   });
}


function updateit(email,password,res){
    MongoClient.connect(url,(err,db)=>{
      let dbase=db.db("users");
      dbase.collection("clients").findOne({email:email},(err,result)=>{
        dbase.collection("clients").update({_id:result["_id"]},{$set:{password:password}},(err,resu)=>{
          if(resu.result.nModified!=0){
              db.close();
              res.send(JSON.stringify("Done"));
          }
        });
      });
    });
}

function addgroup(data,res){
    MongoClient.connect(url,(err,db)=>{
       let dbase=db.db("users");
       dbase.collection("clients").findOne({email:data["email"]},(err,resu)=>{
          dbase.collection("clients").update({_id:resu["_id"]},{$set:{group:data["group"]}},(err,results)=>{
            db.close();
            if(results.result.nModified!=0) res.send(JSON.stringify("Done"));
          });
       });
    });
}

function checkifin(group,switchname,email,res){
  let d="no";
  MongoClient.connect(url,(err,db)=>{
     let arr=new Array();
     let dbase=db.db("users");
     dbase.collection("clients").findOne({email:email},(err,result)=>{
         db.close();
         let r=JSON.stringify(result.group).replace(/[\\\"\[\]\{\}]/g,"");
         let elements=r.split(",");
         elements.forEach((elem,index)=>{
           let l=elem.substring(elem.indexOf(":")+1,elem.indexOf("^"));
           arr=l.split(",");
           if(elem.length==0) elements.splice(index,1);
         });
         for(let i=0;i<elements.length;i++){
             if(elements[i].indexOf(group)!=-1 && arr.indexOf(switchname)!=-1) {
               d="yes";
            }
        }
        if(d=="yes"){
            res.send(JSON.stringify("Yes"));
        }else{
            res.send(JSON.stringify("No"));
        }  
    });
  });
}

function switchandg(res,data){
    MongoClient.connect(url,(err,db)=>{
       let dbase=db.db("users");
       dbase.collection("clients").findOne({email:data["email"]},(err,resu)=>{
        dbase.collection("clients").update({_id:resu["_id"]},{$set:{group:data["group"],switches:data["switches"]}},(err,results)=>{
            db.close();
            if(results.result.nModified!=0) res.send(JSON.stringify("Done"));
       });
     });
  });
}

function addarduinowifi(data,name,res){
    MongoClient.connect(url,(err,db)=>{
      let dbase=db.db("users");
      dbase.collection("arduino").findOne({name:name},(err,result)=>{
         dbase.collection("arduino").update({_id:result["_id"]},{$set:{wifis:data["wifis"],strength:data["strength"],type:data["type"]}},(err,resu)=>{
           db.close();
           if(resu.result.nModified!=0) {
               res.send(JSON.stringify("Done"));
           }else{
               res.send(JSON.stringify("No entry of the arduino found in database"));
           }
         });
      });
    });
}

function showifi(res,wifiname){
    let ssids=new Array();
    let strengths=new Array();
    let securitys=new Array();
    MongoClient.connect(url,(err,db)=>{
      let dbase=db.db("users");
      dbase.collection("arduino").findOne({wifi:wifiname},(err,results)=>{
        db.close();
        res.send(JSON.stringify({ssids:results['wifis'],strengths:results['strength'],securitys:results['type']}));
      });
    });  
}

function checkifwifi(name,res){
    MongoClient.connect(url,(err,db)=>{
        let dbase=db.db("users");
        dbase.collection("arduino").findOne({wifi:name},(err,results)=>{
          db.close();
          if(results!=null) {
              wifiname=name;
              res.send(JSON.stringify("Yes"));
          }else{
              res.send(JSON.stringify("No"));
          }
        });
      });  
}


module.exports={
    insertif:insertif,
    checkif:checkif,
    addswitch:addswitch,
    getswitch:getswitch,
    checkemail:checkemail,
    updateit:updateit,
    sendemail:sendemail,
    insertnow:insertnow,
    addgroup:addgroup,
    checkifin:checkifin,
    switchandg:switchandg,
    addarduinowifi:addarduinowifi,
    showifi:showifi,
    checkifwifi:checkifwifi,
    getwifiname:getwifiname
}
