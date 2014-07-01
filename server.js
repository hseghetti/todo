// set up ========================
	var express  = require('express');
	var app      = express(); 								// create our app w/ express
	var mongoose = require('mongoose'); 					// mongoose for mongodb

// configuration =================

	mongoose.connect('mongodb://node:node@mongo.onmodulus.net:27017/uwO3mypu'); 	// connect to mongoDB database on modulus.io

	app.configure(function() {
		app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
		app.use(express.logger('dev')); 						// log every request to the console
		app.use(express.bodyParser()); 							// pull information from html in POST
	});


//define the model ============
	var Todo = mongoose.model('Todd', {
		text : String,
		done : Boolean

	});

//routes =============================
	//API

	//get all todos
	app.get('/api/todos', function(req, res) {
		Todo.find(function(err, todos) {
			if (err)
				res.send(err);
			res.json(todos);
		});
	});

	// create todo and send back all todos after creation
	app.post('/api/todos', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		Todo.create({
			text : req.body.text,
			done : false
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});

	});

	//todo done
	app.post('/api/todos/done/:todo_id', function(req, res) {
		Todo.findById(req.params.todo_id, function(err, todo) {
			if (!todo)
				res.send("Could not find Todo");
			else {
				todo.done = true;
				todo.save(function(err) {
					if(err) {
						res.send(err + "error rr");
					} else {
						// get and return all the todos after you create another
						Todo.find(function(err, todos) {
							if (err)
								res.send(err);
							res.json(todos);
						});
					}
				});	
			}
		});
	});

	//todo undone
	app.post('/api/todos/undone/:todo_id', function(req, res) {
		Todo.findById(req.params.todo_id, function(err, todo) {
			if (!todo)
				res.send("Could not find Todo");
			else {
				todo.done = false;
				todo.save(function(err) {
					if(err) {
						res.send(err + "error rr");
					} else {
						// get and return all the todos after you create another
						Todo.find(function(err, todos) {
							if (err)
								res.send(err);
							res.json(todos);
						});
					}
				});	
			}
		});
	});

	// delete a todo
	app.delete('/api/todos/:todo_id', function(req, res) {
		Todo.remove({
			_id : req.params.todo_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Todo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});
	});

	// application
	// app.get('*', function(req, res) {
	// 	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	// });

// listen (start app with node server.js) ======================================
	app.listen(process.env.PORT || 5000);
	console.log("App listening on port 5000");