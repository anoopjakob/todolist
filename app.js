// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const myFunctions = require(__dirname + "/myFunctions");

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));




mongoose.connect("mongodb+srv://admin-anoop:taniya77@@@cluster0.acef3.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// TO GET RID OF THE DEPRECATION WARINING
mongoose.set('useFindAndModify', false);

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to-do list."
});
const item2 = new Item({
  name: "Hit the + button to add new item."
});
const item3 = new Item({
  name: "<--- Hit the checkbox to delete an item."
});



const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);

// pre creating a document in list since i found out that the first one created through "/:adress"
// is quiet messy

List.findOne({
  name: "Work"
}, function(err, foundList) {

  if (!err) {

    if (foundList == null) {
      console.log("creating first document...");
      // create a new list
      const list = new List({
        name: "Work",
        items: defaultItems
      });

      list.save();
      console.log("created...");
    }
  }
});

// const listItems = ["buy food", "cook food", "eat food"];
// const workItems = [];


app.get("/", function(req, res) {


  // const day = myFunctions.getDate();
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("inserted successfully");
        }
        res.redirect("/");
      });

    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }



  });

});


app.get("/:customListName", function(req, res) {

  // console.log("/////START/////");
  const customListName = _.capitalize(req.params.customListName);


  // let newcheck = List.findOne({
  //   name: customListName
  // }).exec();

  List.findOne({
    name: customListName
  }, function(err, foundList) {

    if (!err) {
      // console.log("the list found BEFORE IF " + foundList);
      if (foundList == null) {
        // console.log("the list found AFTER IF " + foundList);
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        // console.log("testing inside 1");

        list.save();

        res.redirect("/" + customListName);

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
      // console.log("------END-------");
    }
  });

});


app.post("/", function(req, res) {

  const listName = req.body.list;

  const listItem = req.body.textinput;
  const newItem = new Item({
    name: listItem
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      // console.log("testing inside 2");
      res.redirect("/" + listName);
    });
  }





});


app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  // console.log(req.body.listName);
  listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted item successfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}}, function (err,foundList){
      if(!err){
        res.redirect("/"+listName);
        // console.log("succeessfully deleted");
      }
    });
  }

});




app.get("/about", function(req, res) {
  res.render("about");
});


app.listen(3000, function() {
  console.log("server started on port 3000");
});
