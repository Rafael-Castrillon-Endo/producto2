import express from "express";
import handlebars from "express-handlebars";
import { __dirname } from "./util.js";
 
const app = express();
const port = 3000;

app.engine("handlebars", handlebars.engine());
app.set("views",__dirname+"/views");
app.set("view engine", "handlebars")

// Archivos estáticos (css y js del chat)
app.use(express.static(__dirname+"/public"));


app.get('/', (req, res) => {
    const products=[
        {name_product: "Hamburger chimbisecchions", price: 10},
        {name_product: "Coke", price: 3},
        {name_product: "Pancake", price: 8}        
    ]
    res.render("index",{
    title:"Motores",
    username:"Muchachos",
    admin: true,
    product: products
  })
})

app.get('/contact', (req, res) => {
  res.render("contact",{
    title:"Motores/contacto",
    dato:"Por jugar"
  })
})

// Chat (solo front-end por ahora)
app.get('/chat', (req, res) => {
  res.render("chat",{
    title:"Chat",
    username:"Ejemplo",
    publicidad:[
      "Publicidad · Tu anuncio puede estar aquí",
      "2x1 en cursos de programación este fin de semana",
      "Aprende Handlebars en 7 días"
    ],
    mensajes:[]
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
