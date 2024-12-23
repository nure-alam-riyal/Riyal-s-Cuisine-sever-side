const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 1507
const app=express()
// fYwV0dAYU9VHOZaX
// resturant-management

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nurealamriyal.adrs4.mongodb.net/?retryWrites=true&w=majority&appName=nurealamriyal`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const foodsCollection=client.db('resturant').collection('foods')
    const purchasedFoodsCollection=client.db('resturant').collection('purchasedFoods')
    app.get('/foods',async (req,res) => {
      const sort = { purchaseCount: -1 };
      const result=await foodsCollection.find().sort(sort).limit(6).toArray()
      res.send(result)
    })
    app.get('/allfoods',async(req,res) => {
      const {name}=req.query
      let fiter={}
      if(name){
        fiter={foodName:{ $regex:name,$options:'i'} }
      }
      const result= await foodsCollection.find(fiter).toArray()
      res.send(result)

    })
     app.get('/food/:id',async (req,res) => {
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result=await foodsCollection.findOne(query)
      res.send(result)
     
    })
     app.get('/foods/:email',async (req,res) => {
      const email=req.params.email
      const filter={
        ownerEmail:email
      }
      const result=await foodsCollection.find(filter).toArray()
      res.send(result)
     })
     app.get('/puchaseFoods/:email',async (req,res) => {
      const email=req.params.email
      const filter={
        buyerEmail:email
      }
      const result=await purchasedFoodsCollection.find(filter).toArray()
      res.send(result)
     })



    app.post('/add-food',async (req,res) => {
        const foods=req.body
        const result=await foodsCollection.insertOne(foods)
        res.send(result)

    })
    app.post('/purchased-foods',async (req,res) => {
      const purchasedFoods=req.body
      console.log(purchasedFoods.foods_id)
      // console.log(purchasedFoods)
      const result=await purchasedFoodsCollection.insertOne(purchasedFoods)
      res.send(result)

      const query={_id: new ObjectId(purchasedFoods.foods_id)}
      const options = { upsert: true };
      const updateCount={
      $inc:{
        purchaseCount:1
      }
      }
      
 const updateCountBy1=await foodsCollection.updateOne(query,updateCount,options)

    })
    app.put('/update/:id',async (req,res) => {
      const id=req.params.id
      const data=req.body
      const filter={
        _id:new ObjectId(id)
      }
    const  updateData={
      $set:{
        description:data.description,
        Price:data.Price,
        foodQuantity:data.foodQuantity,
        foodOrigin:data.foodOrigin,
        foodPhoto:data.foodPhoto,
        foodName:data.foodName,
        foodCategory:data.foodName,
        purchaseCount:data.purchaseCount,
      }
    }

    const options={
      upsert:true
    }
      const result=await foodsCollection.updateOne(filter,updateData,options)
      res.send(result)
    })
    app.delete('/purchaseFood/:id',async (req,res) => {
      const id=req.params.id
      const query={
        _id:new ObjectId(id)
      
      }
      const result=await purchasedFoodsCollection.deleteOne(query)
      res.send(result)
    })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('managements sysytem here')
})

app.listen(port,()=>{
    console.log(`server run on the port ${port}`)
})
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/programming-hero-web-course2/b10a11-server-side-nure-alam-riyal.git
// git push -u origin main