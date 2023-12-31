const express = require('express')
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.irfnbkn.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("cardoctor").collection("service") ;
    const bookingCollection = client.db("cardoctor").collection("bookings") ;

    app.get('/services', async(req, res) =>{
        const result = await serviceCollection.find().toArray();
        res.send(result)
    })

    app.get('/services/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};

      const option = {
        projection: {title: 1, price:1, service_id: 1, img: 1 },
      } ;

      const result = await serviceCollection.findOne(query, option);
      res.send(result);
    })


    // bookings
    // booking load by email

    app.get('/bookings', async(req, res) => {
      let query = {};
      if(req.query?.email){
        query = { email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      
      res.send(result);
    })
    

    app.post('/bookings', async(req, res) =>{
      const bookings = req.body;
      const result = await bookingCollection.insertOne(bookings);
      res.send(result)
    })

    app.delete('/bookings/:id', async(req, res) =>{
      const id = req.params.id;
      console.log('req: ', id);
      const query = {_id: new ObjectId(id)} ;
      const result = bookingCollection.deleteOne(query);
      res.send(result);
    })
    

    // jwt auth

    app.post('/jwt', async(req, res) =>{
      const user = req.body;
      const token = jwt.sign({user}, 'secret', {expiresIn: '1h'}) ;
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => res.send('Doctor is running'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))