const express = require('express');
const cors = require('cors');
const port=process.env.PORT || 1507
const app=express()


app.use(express.json())
app.use(cors())
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