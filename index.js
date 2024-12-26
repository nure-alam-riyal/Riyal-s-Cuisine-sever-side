const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 1507
const app = express()
// fYwV0dAYU9VHOZaX
// resturant-management

app.use(express.json())
app.use(cors({
  origin:['http://localhost:5173',
          'https://resturant-management-106b2.web.app'
  ],
  credentials:true
}))
app.use(cookieParser())


const varifyToken=(req,res,next)=>{
  const token=req?.cookies?.token
  if(!token){
    return res.status(401).send({meassage:'unauthorized access'})
  }
  jwt.verify(token, process.env.TOKEN,(err,decoded)=>{
    if(err){
      return res.status(401).send({meassage:'unauthorized access'})
    }
    req.user=decoded
    next()
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nurealamriyal.adrs4.mongodb.net/?retryWrites=true&w=majority&appName=nurealamriyal`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// console.log(process.env.TOKEN)
async function run() {
  try {
    const foodsCollection = client.db('resturant').collection('foods')
    const purchasedFoodsCollection = client.db('resturant').collection('purchasedFoods')
    
    app.post('/jwt',(req,res)=>{
      const user = req.body
     
      const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '1h' });
      res
        .cookie('token',token, {
          httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
        .send({ success: true })
      
    })
    
    app.get('/foods', async (req, res) => {
      const sort = { purchaseCount: -1 };
      const result = await foodsCollection.find().sort(sort).limit(6).toArray()
      res.send(result)
    })
    app.get('/allfoods', async (req, res) => {
      const { name } = req.query
      let fiter = {}
      if (name) {
        fiter = { foodName: { $regex: name, $options: 'i' } }
      }
      const result = await foodsCollection.find(fiter).toArray()
      res.send(result)

    })
    app.get('/food/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await foodsCollection.findOne(query)
      res.send(result)

    })
    app.get('/foods/:email', varifyToken, async (req, res) => {
      // console.log(req?.cookies?.token)
      const email = req.params.email

      if(req.user.email!==email){
        return res.status(403).send({meassage:'forbidden'})
     }
      const filter = {
        ownerEmail: email
      }
      const result = await foodsCollection.find(filter).toArray()
      res.send(result)
    })
    app.get('/puchaseFoods/:email', varifyToken, async (req, res) => {
      const email = req.params.email
      if(req.user.email!==email){
        return res.status(403).send({meassage:'forbidden'})
      }
      const filter = {
        buyerEmail: email
      }
      const result = await purchasedFoodsCollection.find(filter).toArray()
      res.send(result)
    })



    app.post('/add-food',varifyToken, async (req, res) => {
      const foods = req.body
      const result = await foodsCollection.insertOne(foods)
      res.send(result)
    })
    app.post('/purchased-foods',varifyToken, async (req, res) => {
      const purchasedFoods = req.body
      // console.log(purchasedFoods.foods_id)
      // console.log(purchasedFoods)
      const result = await purchasedFoodsCollection.insertOne(purchasedFoods)
      res.send(result)

      const query = { _id: new ObjectId(purchasedFoods.foods_id) }
      const options = { upsert: true };
      const updateCount = {
       
        $inc:{
              purchaseCount: 1,
              foodQuantity:-purchasedFoods?.quantity
        }
      }

      const updateCountBy1 = await foodsCollection.updateOne(query, updateCount, options)

    })
    app.put('/update/:id', async (req, res) => {
      const id = req.params.id
      const data = req.body
      const filter = {
        _id: new ObjectId(id)
      }
      const updateData = {
        $set: {
          description: data.description,
          Price: data.Price,
          foodQuantity: data.foodQuantity,
          foodOrigin: data.foodOrigin,
          foodPhoto: data.foodPhoto,
          foodName: data.foodName,
          foodCategory: data.foodName,
          purchaseCount: data.purchaseCount,
        }
      }

      const options = {
        upsert: true
      }
      const result = await foodsCollection.updateOne(filter, updateData, options)
      res.send(result)
    })
    app.delete('/purchaseFood/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id: new ObjectId(id)

      }
      const result = await purchasedFoodsCollection.deleteOne(query)
      res.send(result)
    })
    app.post("/logout",(req,res)=>{
      res.clearCookie('token',{
        httpOnly:true,
          secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
      })
      .send({logOut:true})
    })
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('managements sysytem here')
})

app.listen(port, () => {
  console.log(`server run on the port ${port}`)
})
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/programming-hero-web-course2/b10a11-server-side-nure-alam-riyal.git
// git push -u origin main