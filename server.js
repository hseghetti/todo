// set up ========================
	var express  = require('express');
	var app      = express(); 								// create our app w/ express
	var mongoose = require('mongoose'); 					// mongoose for mongodb

// configuration =================

	mongoose.connect('mongodb://todo:todoapp@novus.modulusmongo.net:27017/aSazy5qa');

	app.configure(function() {
		app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
		app.use(express.logger('dev')); 						// log every request to the console
		app.use(express.bodyParser()); 							// pull information from html in POST
	});


//define the model ============
	var Todo = new mongoose.Schema({
		text : String,
		done : Boolean
	});

	var User = mongoose.model('User', {
		email : String,
		pass : String,
		todos : [Todo]
	});


//Hardcoded User Creation =P
//create a user temp id=53b4d24f72799b6018000001
	// User.create({
	// 	email : 'asd@qwe.com',
	// 	pass : '123'
	// }, function(err, user) {
	// 	if(err) console.log('default user creation fail');
	// 	else console.log('default user creation success!');
	// 	}
	// );

//routes =============================
	//API

	//get all todos for a User
	app.get('/api/todos', function(req, res) {
		User.findById('53b4d24f72799b6018000001', function(err, user) {
			if (err){
				console.log('Could not load Todos for the User');
				res.send(err);
			}
			res.json(user.todos);
		});
	});//req.body.user.id

	//New To-Do for a User
	app.post('/api/todos', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		User.findById('53b4d24f72799b6018000001', function(err, user) {
			if (err || user == null)
				console.log('could not find user');
			else {
				console.log(user.email);
				user.todos.push({
					text : req.body.text,
					done : false
				});

				user.save(function(err, user) {
					if (err) console.log('could not save user with the new To-do');
					else {
						res.json(user.todos);
					}
				});
			}
		});
	});

	//Done To-do
	app.post('/api/todos/done/:todo_id', function(req, res) {
		User.update( {'_id' : '53b4d24f72799b6018000001', 'todos._id' : req.params.todo_id},
				{$set : {"todos.$.done" : true}},
				function(err) {
					if(err) {
						console.log("Could not update the To-do:Done | " + err);
						res.send(err);
					} else {
						User.findById('53b4d24f72799b6018000001', function(err, user) {
							if (err || user == null)
								console.log('could not find user');
							else
								res.json(user.todos);
						});
					}
				}
		);
	});

 	//UnDone To-Do
	app.post('/api/todos/undone/:todo_id', function(req, res) {
		User.update( {'_id' : '53b4d24f72799b6018000001', 'todos._id' : req.params.todo_id},
				{$set : {"todos.$.done" : false}},
				function(err) {
					if(err) {
						console.log("Could not update the To-do:Done | " + err);
						res.send(err);
					} else {
						User.findById('53b4d24f72799b6018000001', function(err, user) {
							if (err || user == null)
								console.log('could not find user');
							else
								res.json(user.todos);
						});
					}
				}
		);
	});

	//Delete a To-Do
	app.delete('/api/todos/:todo_id', function(req, res) {
		User.findById('53b4d24f72799b6018000001', function(err, user) {
			if (err || user == null)
				console.log('could not find user to delete the To-Do');
			else {
				user.todos.id(req.params.todo_id).remove();
				user.save(function(err) {
					if(err){
						console.log('Could not save User after delete the To-Do');
						res.send(err);
					} else {
						res.json(user.todos);
					}
				});
			}
		});
	});

	// application
	// app.get('*', function(req, res) {
	// 	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	// });

// listen (start app with node server.js) ======================================
	app.listen(process.env.PORT || 5000);
	console.log("App listening on port 5000");