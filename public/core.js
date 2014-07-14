var todo = angular.module('todo', []);

todo.controller('UserCtrl', function ($scope, $http, $window) {
  $scope.user = {username: 'has', password: '123'};
  $scope.message = '';

  $scope.submit = function () {
    $http
      .post('/authenticate', $scope.user)
      .success(function (data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        $scope.login = true; // ver si esta linea hace falta
        $scope.todos();


      })
      .error(function (data, status, headers, config) {
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;

        // Handle login errors here
        $scope.message = 'Error: Invalid user or password';
      });
  };

  $scope.logout = function () {
  	$http.get('/logout')
  		.success(function (data, status, headers, config) {
  			delete $window.sessionStorage.token;
  			// console.log('token deleted');
  			$scope.login = false;
  			$scope.initTodos();
  		})
  		.error(function (data, status, headers, config) {
  			console.log('delete token error');
  		});
  };
});

todo.factory('authInterceptor', function ($rootScope, $q, $window) {

  return {
    request: function (config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
        $rootScope.login = true;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {
        // handle the case where the user is not authenticated
        $rootScope.login = false;
      }
      return response || $q.when(response);
    }
  };
});

todo.config(function ($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});

todo.controller('mainController', function mainController($scope, $rootScope, $http) {
	$scope.formData = {};

	//when landing on the page, get all todos and show them
	$scope.initTodos = function() {
		$http.get('/')
			.success(function(data) {
				if($scope.login) {
					$scope.todos();
				} else {
					$scope.todosPending = {};
					$scope.todosDone = {};
					$scope.remaining = '';
				}
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	}
	$scope.todos = function() {
		$http.get('/api/todos')
			.success(function(data) {
				// console.log(data);
				$scope.todosPending = $todosPending(data);
				$scope.todosDone = $todosDone(data);
				$scope.remaining = $remaining(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	};
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

	//Document Ready
	angular.element(document).ready(function () {
        $scope.todos();
    });
});

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


