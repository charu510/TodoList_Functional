//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//creating a new database inside the mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB");

//creating the itemsSchema
const itemsSchema = {
  name: String
};

//creating the model
const Item = mongoose.model("Item",itemsSchema);

//creating the documents
const item1 = new Item({
  name: "Study"
});

const item2 = new Item({
  name: "Attend the webinar"
});

const item3 = new Item({
  name: "Research"
});

//saving it into the database





app.get("/", function(req, res) {


  //making the find function
  Item.find({},function(err,foundItems){
    //checking if the foundItems array is empty
    if(foundItems.length == 0){
      const defaultItems = [item1,item2,item3];
      Item.insertMany(defaultItems,function(err){
        if(err){
            console.log(err)
        }else{
          console.log("Successfully inserted the items")
        }
      });
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  });
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  //creating a new item document on the basis of the input received from the post request
  const item = new Item({
    name: itemName
  });

  //using the save
  item.save();

  res.redirect("/")

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

//adding the route for delete
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  
  //making the delete function
  Item.findByIdAndRemove({_id:checkedItemId}, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted the item!!")
    }
  })

  //for the purpose of redirecting it
  res.redirect("/");
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
