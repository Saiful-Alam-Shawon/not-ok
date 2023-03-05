let express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId, CURSOR_FLAGS } = require('mongodb');
const app = express();
require('dotenv').config();


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kyk1ijo.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
    try {
        const allInfo = client.db('ecook').collection('allInfo');
        const allUsers = client.db('ecook').collection('users');
        const allBooking = client.db('ecook').collection('booking');

        // get all recipe
        app.get('/all', async (req, res) => {
            const query = {};
            const cursor = await allInfo.find(query).toArray();
            res.send(cursor)
        });

        // get recipe by category Dynamically
        app.get('/category/:id', async (req, res) => {
            const searchCategory = req.params.id;
            // console.log(searchCategory);
            const category = { category: searchCategory };
            // console.log(category)
            const query = await allInfo.find(category).toArray();
            // console.log(query)
            res.send(query)
        });


        // get recipe Details by id Dynamically
        app.get('/details/:id', async (req, res) => {
            const searchReceipe = req.params.id;
            // console.log(searchReceipe);
            const receipe = { _id: ObjectId(searchReceipe) };
            // console.log(receipe)
            const query = await allInfo.find(receipe).toArray();
            // console.log(query)
            res.send(query)
        });
        // http://localhost:5000/details/63d494a3d7058ba76a9c1c3a


        // Search Query for HomePage
        app.get('/search', async (req, res) => {
            // const searchField = req.query.title;
            // console.log(searchField);
            // const data = await allInfo.find({ title: { $regex: searchField, $options: 'i' } }).toArray();
            const searchField = req.query.strMeal;
            const data = await allInfo.find({ strMeal: { $regex: searchField, $options: 'i' } }).toArray();
            res.send(data)
        });
        // http://localhost:5000/search?strMeal=fat


        // Register data is posting
        app.post('/register', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const result = await allUsers.insertOne(user);
            res.send(result);
        });


        // Booking  product post
        app.post('/booking', async (req, res) => {
            const product = req.body;
            // console.log(product);
            const result = await allBooking.insertOne(product);
            res.send(result);
        });


        // Buyer Email Based for Custom Hooks
        app.get('/buyer/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { userEmail: email };
            // console.log(query);
            const user = await allUsers.findOne(query);
            // console.log(user);
            res.send({ isBuyer: user?.userRole === 'Buyer' })
        });

        // Admin Email Based for Custom Hooks
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { userEmail: email }
            // console.log(query);
            const result = await allUsers.findOne(query);
            // console.log(result);
            res.send({ isAdmin: result?.userRole === 'Admin' })
        });

        // Seller Email Based for Custom Hooks
        app.get('/seller/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { userEmail: email };
            // console.log(query);
            const user = await allUsers.findOne(query);
            // console.log(user);
            res.send({ isSeller: user?.userRole === 'Seller' })
        });


        // Buyer Get his product by his email
        app.get('/buyerProductsByEmail', async (req, res) => {
            email = req.query.email;
            // console.log(email);
            const query = { userEmail: email };
            const product = await allBooking.find(query).toArray();
            res.send(product);
        });
        // http://localhost:5000/buyerProductsByEmail?email=${user?.email}


        // Seller Added Product 
        app.post('/allProducts', async (req, res) => {
            const product = req.body;
            const result = await allInfo.insertOne(product);
            res.send(result);
        });


        // Seller Product Gets Based On email
        app.get('/sellerProductsByEmail', async (req, res) => {
            email = req.query.email;
            // console.log(email);
            const query = { userEmail: email };
            const product = await allInfo.find(query).toArray();
            res.send(product);
        });


        //  Delete Product from Seller's All product
        app.delete('/deletingProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await allInfo.deleteOne(query);
            res.send(user);
        });


        // Get The all Users in Admin DashBoard
        app.get('/allusers', async (req, res) => {
            const query = {}
            const user = await allUsers.find(query).toArray();
            // console.log(user);
            res.send(user);
        });


        // Get The all Buyers in Admin DashBoard
        app.get('/allbuyers', async (req, res) => {
            const query = { userRole: "Buyer" };
            const user = await allUsers.find(query).toArray();
            // console.log(user);
            res.send(user);
        });


        // Get The all Seller in Admin DashBoard
        app.get('/allsellers', async (req, res) => {
            const query = { userRole: "Seller" };
            const user = await allUsers.find(query).toArray();
            // console.log(user);
            res.send(user);
        });


        // User Verified By Admin
        app.put('/user/verify/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'Verified'
                }
            }
            const updatedUser = await allUsers.updateOne(query, updatedDoc, options,);
            res.send(updatedUser);
        });

        app.put('/booking/status/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: 'Paid'
                }
            }
            const statusUpdated = await allBooking.updateOne(query, updatedDoc, options,);
            res.send(statusUpdated);
        });



        // Delete Buyer & Seller by Admin
        app.delete('/deletingUser/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await allUsers.deleteOne(query);
            res.send(user);
        });


        // Delete Product from Buyer's product
        app.delete('/BuyerProduct/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: ObjectId(id) };
            // console.log(query);
            const user = await allBooking.deleteOne(query);
            res.send(user);
        });





        // --------------------------------------AssignMent12-Server All Code--------------------------------------










        // app.get('/blog', async (req, res) => {
        //     const query = {};
        //     const blogs = await blogColl.find(query).toArray();
        //     res.send(blogs)
        // });

        // 



        // Product Payment

        // app.get('/dashboard/dash1boar1db1/pay/:id', async (req, res) => {

        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await bookedColl.findOne(query);
        //     res.send(result);
        // })

        // Get the ads

        // app.get('/ads', async (req, res) => {
        //     const query = {};
        //     const options = await adsColl.find(query).toArray();
        //     res.send(options);
        // });

        // Buyer booked Product post
        // app.post('/booked', async (req, res) => {
        //     const product = req.body;
        //     const result = await bookedColl.insertOne(product);
        //     res.send(result);
        // });

    } catch (error) {

    }
};
run().catch(console.log)



app.get('/', async (req, res) => {
    res.send('Ecook Server is Running');
});

app.listen(port, () => console.log(`Server is Running in ${port} Port`))