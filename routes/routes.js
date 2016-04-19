var express = require('express');
var router = express.Router();

var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  //TODO: Read username and password from file
  if (user.name === 'foo' && user.pass === 'bar') {
    return next();
  } else {
    return unauthorized(res);
  };
};

/* delete entry by id */
router.delete('/admin/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('pending_tributes');
    collection.remove({"_id" : req.params.id}, function(err) {
      res.send((err==null) ? {msg: ''} : {msg: 'error: ' + err});
    });
});

/* POST to Add User Service */
router.post('/admin/:name/:tribute', function(req, res) {

    var db = req.db;

    var name = req.params.name;
    var tribute = req.params.tribute;

    // Set our collection
    var collection = db.get('usercollection');

    collection.update(
      {"name" : name},
      { $push : { list_of_tributes : tribute} }
    
    , function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
            res.redirect("/admin");
        }
    });
});

/* GET admin page. */
router.get('/admin', auth, function(req, res) {
    var db = req.db;
    var collection = db.get('pending_tributes');
    collection.find({}, {}, function(e,docs){
        res.render('admin', {
            "pending_tributes" : docs
        });
    });

});

/* GET home page. */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.distinct("country", {}, function(e,docs){
        res.render('countrylist', {
            "title" : "Countries",
            "countries" : docs
        });
    });
});

/* GET thank you page. */
router.get('/thankyou', function(req, res) {
    res.render('thankyou', {});
});

/* GET country page. */
router.get('/:country', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({"country" : req.params.country}, {}, function(e,docs){
        res.render('fallensoldiers', {
            "curr_country" : req.params.country,
            "title" : "Fallen Soldiers",
            "fallen_soldiers" : docs
        });
    });
});

/* GET soldier page. */
router.get('/:country/:soldier', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({"name" : req.params.soldier}, {}, function(e,docs){
        res.render('tributepage', {
            "title" : req.params.soldier,
            "tributes" : docs[0].list_of_tributes
        });
    });
});

/* POST to Add User Service */
router.post('/addtribute', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // get the soldier name and country
    var referer = req.get('referer');
    var split_url = referer.split('/');
    var soldier_country = split_url[split_url.length - 2];
    var soldier_name = split_url[split_url.length - 1].replace("%20", " ");

    // Get our form values. These rely on the "name" attributes
    // TODO: currently not doing anything with the username or user country
    var userName = req.body.userhometown;
    var userCountry = req.body.userhometown;
    var tribute = req.body.usertribute;

    // Set our collection
    var collection = db.get('pending_tributes');

    // Submit to the DB
    collection.insert({
        //TODO: need to fix the db to have more clear entry names
        "username" : soldier_name,
        "country" : soldier_country,
        "tribute" : tribute
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            //TODO: make cheesy thank you page to avoid figuring out ajax... lame
            res.redirect("/thankyou");
        }
    });
});

module.exports = router;
