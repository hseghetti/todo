var todo = angular.module('todo', []);

function mainController($scope, $http) {
	$scope.formData = {};

	//when landing on the page, get all todos and show them
	$http.get('/api/todos')
		.success(function(data) {
			console.log(data);
			$scope.todosPending = $todosPending(data);
			$scope.todosDone = $todosDone(data);
			$scope.remaining = $remaining(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});

	// when submitting the add form, send the text to the node API
	$scope.createTodo = function() {
		$http.post('/api/todos', $scope.formData)
			.success(function(data) {
				$scope.formData = {}; // clear the form so our user is ready to enter another
				$scope.todosPending = $todosPending(data);
				$scope.todosDone = $todosDone(data);
				$scope.remaining = $remaining(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// delete a todo after checking it
	$scope.deleteTodo = function(id) {
		$http.delete('/api/todos/' + id)
			.success(function(data) {
				$scope.todosPending = $todosPending(data);
				$scope.todosDone = $todosDone(data);
				$scope.remaining = $remaining(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// done a todo after checking it
	$scope.doneTodo = function(id) {
		$http.post('/api/todos/done/' + id)
			.success(function(data) {
				$scope.todosPending = $todosPending(data);
				$scope.todosDone = $todosDone(data);
				$scope.remaining = $remaining(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	// done a todo after checking it
	$scope.undoneTodo = function(id) {
		$http.post('/api/todos/undone/' + id)
			.success(function(data) {
				$scope.todosPending = $todosPending(data);
				$scope.todosDone = $todosDone(data);
				$scope.remaining = $remaining(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	$remaining = function(todos) {
		var count = 0;
		angular.forEach(todos, function(t) {
			count += t.done ? 0 : 1;
		});
		return count;
	};

	$todosPending = function(todos) {
		var todosPending = [];
		angular.forEach(todos, function(t) {
			if(!t.done) {
				todosPending.push(t);
			}
		});
		return todosPending;
	};

	$todosDone = function(todos) {
		var todosDone = [];
		angular.forEach(todos, function(t) {
			if(t.done) {
				todosDone.push(t);
			}
		});
		return todosDone;	
	};

}
