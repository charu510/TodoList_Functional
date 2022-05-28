//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require('lodash');

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

//creating a new schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//creating the model
const Item = mongoose.model("Item",itemsSchema);

//creating the model
const List = mongoose.model("List",listSchema);

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

const defaultItems = [item1,item2,item3];

//saving it into the database





app.get("/", function(req, res) {


  //making the find function
  Item.find({},function(err,foundItems){
    //checking if the foundItems array is empty
    if(foundItems.length == 0){
     
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
  const listName = req.body.list;

  //creating a new item document on the basis of the input received from the post request
  const item = new Item({
    name: itemName
  });

  if(listName == "Today"){
    //using the save
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item)
      foundList.save();

      res.redirect("/" + listName)
    });
  }

  

});

//creating the custom route
app.get("/:customListName", function(req,res){
  //storing the customListName
  const customListName = _.capitalize(req.params.customListName);

  //checking whther the list name is present inside the collection
  List.findOne({name: customListName}, function(err,foundList){
      if(!err){
        if(!foundList){
          //create a new list
            //making the document
            const list = new List({
            name: customListName,
            items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName)
        }else{
          //show the existing list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        }
      }
  })

  

  //saving the document
})

app.get("/about", function(req, res){
  res.render("about");
});

//adding the route for delete
app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    //making the delete function
    Item.findByIdAndRemove({_id:checkedItemId}, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully deleted the item!!")
          //for the purpose of redirecting it
          res.redirect("/");
        }
      })
      
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkedItemId}}}, function(err,foundList){
            if(!err){
              res.redirect("/" + listName);
            }
    })
  }
  
  

  
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
