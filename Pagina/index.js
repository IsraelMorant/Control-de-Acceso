const SerialPort =require('serialport').SerialPort;
const {DelimiterParser} = require('@serialport/parser-delimiter');

const nodemailer = require('nodemailer'); 

//Funcion y configuracion para el evio del correo electronico

enviarMail =(estado,subj) =>{

    const config={


        host:'smtp.gmail.com',
        port:587,
        auth:{

            user:'Correo Gmail del remitente',
            pass: 'App password de la cuenta del remitente Tutorial de como crear el password:https://www.youtube.com/watch?v=uVDq4VOBMNM'
        }
    }

    const mensaje = {

        from:'Control de acceso',
        to:'Correo Gmail del Desinatario',
        subject: subj,
        text:  'Tarjeta: '+global.ready.trim().replace(/ /g, '')+" "+estado+' con exito'
    }

  const transport = nodemailer.createTransport(config);

  transport.sendMail(mensaje, (error, info) => {
    if (error) {
      return console.log('Error al enviar el correo:', error);
    }
    console.log('Correo enviado: %s', info.messageId);
  });
}
let ultimoMensaje = { tipo: '', mensaje: '' };

const puerto = new SerialPort({
path: 'COM4',
baudRate:115200

});

const parser = puerto.pipe(new DelimiterParser({delimiter: '\n'}))


parser.on('open',function(){

    console.log('Conexion abierta');
});

parser.on('data',function(data){
   // var ready = global.ready;
    var enc = new TextDecoder;
    var arr = new Uint8Array(data);
    ready = enc.decode(arr);
    ready =  ready.toString();
    console.log(ready);

    //Estatus

    let num=global.ready.trim().replace(/ /g, '');
    global.ready = num;

let buscar = "SELECT * FROM tarjetas WHERE numTar= ?";
conexion.query(buscar,[num],function(e,ressultado){

    if (e) {
        throw e;
    }else{

        if (ressultado.length>0) {
             ultimoMensaje = { tipo: "exito", mensaje: "Acceso Permitido" };
            console.log("Acceso Permitido");
            //Enviar comadno para prender el led verde
              puerto.write("Autorizo\n", (err) => {
                if (err) {
                    return console.log('Error al enviar dato:', err.message);
                }
            });
        }else{
                ultimoMensaje = { tipo: "exito", mensaje: "Acceso Denegado" };
                console.log("Acceso Denegado");
                 puerto.write("NoAutorizo\n", (err) => {
                if (err) {
                    return console.log('Error al enviar dato:', err.message);
                }
            });
        }
    }
});


});
/////////
const mysql = require("mysql");

let conexion = mysql.createConnection({

    host:"localhost",
    database:"control_de_acceso",
    user:"root",
    password:""

});

const express= require("express");

const app = express();




app.set("view engine","ejs");


app.use(express.static('public'));


//app.use(express.json);
app.use(express.urlencoded({extended:false}));

app.get("/",function (req,res) {
    res.render("login");
});


app.post("/login",function(req,res){


    const datos= req.body;

    let usuario = datos.txtusuario;

    let contra = datos.txtcontra

 
    if (usuario == "root" && contra == "6030") {
      //res.render("alta");
          res.render("alta", { 
                mensaje: "Bienvenido",
                mensajeError: null
            });
    }else{

        //res.render("login"); Sin alerto con alerta
          res.render("login", { 
                mensaje: null,
                mensajeError: "Error: Contraseña o Usuario Incorrectos." 
            });
    }
});


//Insertar tarjerta
app.post("/insertar",function(req,res){
 
const datos = req.body;


let nom=datos.txtNom;
let num=global.ready.trim().replace(/ /g, '');
let rang = datos.txtRango;

let buscar = "SELECT * FROM tarjetas WHERE numTar= ?";
conexion.query(buscar,[num],function(e,ressultado){

    if (e) {
        throw e;
    }else{

        if (ressultado.length>0) {
              res.render("alta", { 
                mensaje: null,
                mensajeError: "Error: La tarjeta ya se encuentra registrada." 
            });
            console.log("Usuario ya existente");
        }else{

            let registrar="INSERT INTO tarjetas (numTar,nombre,rango) VALUES ('"+num+"' ,'"+nom+"','"+rang+"')";

conexion.query(registrar,function(e){

    if (e) {
        throw e;
    }else{

        console.log("Datos almacenados correctamente");
          res.render("alta", { 
                mensaje: "Tarjeta dada de alta correctamente",
                mensajeError: null 
            });

            enviarMail("Registrada","Tarjeta dada de alta");
    }
});

        }
    }

});


});

//Eliminar Tarjeta

app.post("/eliminar",function(req,res){

let num=global.ready.trim().replace(/ /g, '');


let buscar = "SELECT * FROM tarjetas WHERE numTar= ?";
conexion.query(buscar,[num],function(e,ressultado){

    if (e) {
        throw e;
    }else{

        if (ressultado.length>0) {
            let eliminar="DELETE FROM tarjetas WHERE numTar= ?";

conexion.query(eliminar,[num],function(e){

    if (e) {
        throw e;
    }else{

        console.log("Tarjeta eliminada correctamente");
          res.render("alta", { 
                mensaje: "Tarjeta eliminada correctamente",
                mensajeError: null 
            });
            enviarMail("Eliminada","Tarjeta eliminada");
    }
});
              
            //console.log("Usuario encontrado");
        }else{

            res.render("alta", { 
                mensaje: null,
                mensajeError: "Error: La tarjeta no se encuentra registrada." 
            });

        }
    }

});
});


//Para mensaje dinamico de tarjeta

app.get("/ultimo-acceso", function(req, res) {
    
    res.json(ultimoMensaje);
    
    
    ultimoMensaje = { tipo: '', mensaje: '' };
});

//Para iniciar el servidor
app.listen(3000,function(){

console.log("Servidor creado http://localhost:3000")

});

//Para cuando se reciba ctrl+c se cierre el servido y el puerto correctamente
process.on('SIGINT', () => {
  console.log('\nRecibido Ctrl+C (Para interrupor el servidor) Cerrando conexiones');

  
  puerto.close((err) => {
    if (err) {
      console.log('Error al cerrar el puerto serial:', err.message);
    } else {
      console.log('Puerto serial cerrado correctamente.');
    }

   
    conexion.end((err) => {
      if (err) {
        console.log('Error al cerrar la conexión a la base de datos:', err.message);
      } else {
        console.log('Conexión a la base de datos cerrada correctamente.');
      }

      
      process.exit();
    });
  });
});

