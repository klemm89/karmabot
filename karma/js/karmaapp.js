var app = angular.module("app",['ngAnimate-animate.css','ngDropdowns', 'firebase']);

app.factory('Data', function() {
    return {message: "I'm data from a service"}
})
/*
function GetUser($scope){
	$http({
	    url: "http://sandbuckets.herokuapp.com/getUser",
	    method: "GET"
	}).success(function(data, status, headers, config) {
	    $scope.data = data;
	}).error(function(data, status, headers, config) {
	    $scope.status = status;
	});
}*/

function MafiaGame($scope, $http, $firebase){
	var ref = new Firebase("https://vh7i8ybyrmd.firebaseio-demo.com/");
    $scope.messages = $firebase(ref).$asArray();

	$scope.debug = false;
	$scope.Game = {};
	$scope.Game.players = [/*{name: "testPlayer", alive: 'true'},{name: "testPlayer", alive: 'true'},{name: "testPlayer", alive: 'true'}*/];
    $scope.playersAlive = [];
    $scope.playersDead = [];
    $scope.user = {loggedIn: false};
    $scope.thisPlayer = {name: null, role: null, email: null};
	$scope.currentRoom = null;
	$scope.clearTimer = function(){
		console.log("Stopping refresh timer");
		window.clearInterval($scope.refreshTimer);
	};
	$scope.startTimer = function() {
		if($scope.debug == true)
		{
			return;
		}
		console.log("Starting refresh timer");
		$scope.refreshTimer = window.setInterval(function(){
							$scope.refreshGame();
						}, 1000);
	};

	if(!$scope.debug){
		$scope.refreshTimer = window.setInterval(function(){
								$scope.refreshGame();
							}, 1000);
	}

	$scope.login = function(){
		$http.get("auth/google")
		.success(function(data, status, headers, config) {
		    $scope.refreshGame();
		    console.log("Game state refreshed");
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		});
	};

	$scope.testAnimate = function(){
		$scope.Game.players.push({name: "test", alive: true});
	};

	$scope.testAnimateDelete = function(){
		$scope.Game.players = [];
	};

	$scope.resetGame = function(){
		$scope.getPlayer();
		$http.get("/mafia/resetGame")
		.success(function(data, status, headers, config) {
		    $scope.Game = data;
		    console.log("Game state refreshed");
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		});
	};

	$scope.refreshRooms = function(){
		$http.get("/getRooms")
		.success(function(data, status, headers, config) {
		    $scope.Rooms = data.rooms;
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		});
	};

	$scope.refreshGame = function(){
		console.log("Refreshing game");
		$scope.getPlayer();
		if($scope.user.loggedIn == false){
			return;
		}
		$scope.refreshPlayerStatus();
		$http.get("/mafia/getGame")
		.success(function(data, status, headers, config) {
		    $scope.Game = data;
		    $scope.updatePlayerList();
		    
		    if($scope.Game.currentRound == $scope.thisPlayer.role || $scope.Game.currentRound == "Day"){
		    	$scope.clearTimer();
		    };
		    console.log("Game state refreshed");
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		});
	};

	$scope.updatePlayerList = function(){
		var aliveTrue = function(element){
		    return (element.alive);
		};

		var aliveFalse = function(element){
		    return !(element.alive);
		};

		var playersAlive = $scope.Game.players.filter(aliveTrue);
		var playersDead = $scope.Game.players.filter(aliveFalse);


	    if($scope.playersAlive.length != playersAlive.length)
	    {
	    	$scope.playersAlive = playersAlive;
	    	$scope.playersDead = playersDead;
	    }
	};

	$scope.refreshPlayerStatus = function(){
		return $http.get("/playerStatus")
		.success(function(data, status, headers, config) {
		    $scope.thisPlayer = data;
		    console.log("Retrieved user data: " + data);
		    console.log("Set user: " + $scope.thisPlayer.name +"|"+$scope.thisPlayer.role);
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		    console.log($scope.status);
		});
	};
	$scope.getPlayer = function(){
		return $http.get("/getUser")
		.success(function(data, status, headers, config) {
			if(data.loggedIn)
			{
			    $scope.data = data;
			    var player = {name: data.displayName, email: data.emails[0].value, alive: true, role:"", loggedIn: data.loggedIn};
			    $scope.user = player;
			    console.log("Retrieved user data: " + $scope.data);
			    console.log("Set user name: " + $scope.user.name);
			}
			else{
				console.log("User not logged in");
			}
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		    console.log($scope.status);
		});
	};

	$scope.goToRoom = function(roomName){
		var params = {"room": roomName};
		$http.get("/mafia/goToRoom")
		.success(function(data, status, headers, config) {
		    $scope.currentRoom = data.room;
		    $scope.currentRound = data.currentRound;
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		});
		$scope.refreshGame();
	};

	$scope.createPlayer = function(playerName){
		var player = {name: playerName, role:"", alive:true};
		var data = {player: player};
		console.log(data);
		return $http.post("/mafia/createPlayer",data)
		.success(function(data, status, headers, config) {
		    console.log("Create player request SUCCESS");
		}).error(function(data, status, headers, config) {
		    console.log("Create player request FAIL");
		});
	};

	$scope.sendMafiaVote = function(victim){

		var data = {kill: victim};
		console.log(data);
		return $http.post("/mafia/submitMafiaVote",data)
		.success(function(data, status, headers, config) {
		    console.log("Choose victim request SUCCESS");
		}).error(function(data, status, headers, config) {
		    console.log("Choose victim request FAIL");
		});
	};

	$scope.sendSavedChoice = function(player){

		var data = {saved: player};
		console.log(data);
		return $http.post("/mafia/chooseSaved",data)
		.success(function(data, status, headers, config) {
		    console.log("Choose saved request SUCCESS");
		}).error(function(data, status, headers, config) {
		    console.log("Choose saved request FAIL");
		});
	};

	$scope.sendPlayerVote = function(player){

		var data = {voteOff: player};
		console.log(data);
		return $http.post("/mafia/submitPlayerVote",data)
		.success(function(data, status, headers, config) {
		    console.log("Vote for player request SUCCESS");
		}).error(function(data, status, headers, config) {
		    console.log("Vote for player request FAIL");
		});
	};

	$scope.getInvestigationResult = function(investigatedPlayer){
		var data = {investigate: investigatedPlayer};
		console.log(data);
		
		return $http.post("/mafia/investigate",data)
		.success(function(data, status, headers, config) {
			var result = data;
		    console.log("Investigate request SUCCESS");
		    return result;
		}).error(function(data, status, headers, config) {
		    console.log("Investigate request FAIL");
		});

	};

	$scope.nextRound = function(){
		return $http.get("/mafia/nextRound")
		.success(function(data, status, headers, config) {
			console.log("Next Round request SUCCESS");
		}).error(function(data, status, headers, config) {
		    $scope.status = status;
		    console.log("Next Round request FAIL")
		});
	};

}
/*---------------Directives---------------*/

app.directive("mafiaround", function(){
	return {
		restrict: "E",
		transclude: true,
		templateUrl: 'mafia-round.html',
		link: function(scope){
			scope.chooseVictim = function(){
				var victim = scope.mafiaVictim;
				console.log("Chose victim: " + victim);

				var victimChoosePromise = scope.sendMafiaVote(victim);
				victimChoosePromise.then(function(){
					scope.refreshGame();
					scope.startTimer();
				});			
	
				console.log("Mafia round over");
			};

		}
	}
})

app.directive("doctorround", function(){
	return {
		restrict: "E",
		transclude: true,
		templateUrl: 'doctor-round.html',
		link: function(scope){
			scope.chooseSaved = function(){

				var savedPlayer = scope.doctorSaved;
				console.log("Doctor saved: " + savedPlayer);

				var savedChoosePromise = scope.sendSavedChoice(savedPlayer);
				savedChoosePromise.then(function(){
					scope.refreshGame();
					scope.startTimer();
					console.log("Doctor round over");
				});	

			};

		}
	}
})

app.directive("sherriffround", function(){
	return {
		restrict: "E",
		transclude: true,
		templateUrl: 'sheriff-round.html',
		link: function(scope, $http){
			scope.investigationDone = false;
			scope.isMafia = false;
			scope.notMafia = false;
			scope.result = {found: false, message: ""};
			if(scope.thisPlayer.role == "sheriff")
			{
				scope.clearTimer();
			}

			scope.chooseInvestigate = function(){
				var investigatedPlayer = scope.sheriffInvestigate;
				console.log("investigating " + investigatedPlayer);
				var investigationPromise = scope.getInvestigationResult(investigatedPlayer);
				investigationPromise.then(function( result){
					scope.result = result.data;
					scope.investigationDone = true;
					scope.startTimer();
				});
			};

			scope.sheriffDone = function(){
				var nextRoundPromise = scope.nextRound();
				nextRoundPromise.then(function(){
					//reset variables
					scope.investigationDone = false;
					scope.isMafia = false;
					scope.notMafia = false;
					
					console.log("sheriff round over");
				});
				
			};

		}
	}
})

app.directive("dayround", function(){
	return {
		restrict: "E",
		transclude: true,
		templateUrl: 'day-round.html',
		link: function(scope){
			scope.personSaved = false;
			scope.personKilled = false;
			scope.showVote = false;

			scope.decideOutcome = function(){
	
				if(scope.Game.roundResult.winner === "doctor")
				{
					scope.personSaved = true;
				}
				else
				{
					scope.personKilled = true;
				}

				scope.showVote = true;
			};

			scope.votePlayerOff = function(){
				scope.sendPlayerVote(this.voteOff);
				scope.startTimer();
			};

		}
	}
})

app.directive("mafiawin", function(){
	return {
		restrict: "E",
		transclude: true,
		templateUrl: 'mafia-win.html',
		link: function(scope){		

		}
	}
})

app.directive("citizenwin", function(){
	return {
		restrict: "E",
		transclude: true,
		templateUrl: 'citizen-win.html',
		link: function(scope){

		}
	}
})
/*-----Initial Setup-----------*/
app.directive("setup", function(){
	return {
		restrict: "E",
		transclude: true,
		templateUrl: 'setup.html',
		link: function(scope){

			scope.refreshRooms();
			scope.numMafia = "1";
			scope.Doctor = "No";
			scope.Sheriff = "No";
			scope.selectOptions = [{text:"Yes"}, {text:"No"}];
			scope.mafiaOptions = ["1", "2", "3"];
			scope.align = "left";
			scope.createRoom = function(){
				var name = this.text;

				var data = {"roomName": name
							};
				$.get('mafia/createRoom', data);
				this.text = '';
				scope.refreshRooms();
			};

			scope.joinGame = function(){
				// Wait for data
				var getPlayerPromise = scope.getPlayer();
				getPlayerPromise.then(function(){
					var name = scope.user.name;
					console.log("player: " + name);
					if(name ==='')
					{
						console.log("empty string for player name");
						return;
					}
					else{
						var createPlayerPromise = scope.createPlayer(name);
						/*var player = {name: name, role:"", alive:true};
						var data = {"player": player};
						$.get('/mafia/addPlayer', data);*/
						createPlayerPromise.then(function(){
							scope.refreshGame();
						});											
								
					}
				});				
			};

			scope.startGame = function(){
				var data = {
					"numMafia" : this.numMafia,
					"Doctor": this.Doctor,
					"Sheriff": this.Sheriff
				};

				$.get('/mafia/startGame', data);
				scope.refreshGame();
				console.log("game started");
			};
		}
	}
})
