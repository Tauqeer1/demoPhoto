//var fb = new Firebase("https://appphotosharing.firebaseio.com");

angular.module('starter', ['ionic', 'firebase', 'ngCordova'])


  .factory('authFactory', [function () {
    var FirebaseRef = new Firebase("https://appphotosharing.firebaseio.com");
    return {
      ref: FirebaseRef
    }
  }])

  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('firebase', {
        url: '/firebase',
        templateUrl: 'templates/firebase.html',
        controller: 'FirebaseController',
        controllerAs: 'fbCtrl',
        cache: false
      })
      .state('secure', {
        url: '/secure',
        templateUrl: 'templates/secure.html',
        controller: 'SecureController',
        controllerAs: 'secureCtrl'
      });
    $urlRouterProvider.otherwise('/firebase');

  }])
  .controller('FirebaseController', ['$state', '$firebaseAuth', 'authFactory', function ($state, $firebaseAuth, authFactory) {

    var _self = this;
    //var fbAuth = $firebaseAuth(fb);
    var fbAuth = $firebaseAuth(authFactory.ref);

    _self.login = function (email, password) {
      fbAuth.$authWithPassword({
        email: email,
        password: password
      }).then(function (authData) {
        $state.go('secure');
      }).catch(function (error) {
        console.error("Login Error :  ", error);
      })
    };
    _self.register = function (email, password) {
      //Register the user and immediately sign them in after registering  successfully
      fbAuth.$createUser({
          email: email,
          password: password
        })
        .then(function (userData) {
          return fbAuth.$authWithPassword({
              email: email,
              password: password
            })
            .then(function (authData) {
              $state.go('secure');
            })
            .catch(function (error) {
              console.error("Registration Error : ", error);
            })
        })
    };
  }])
  .controller('SecureController', ['$ionicHistory', '$firebaseArray', '$cordovaCamera', 'authFactory', '$firebaseAuth', function ($ionicHistory, $firebaseArray, $cordovaCamera, authFactory, $firebaseAuth) {
    var _self = this;

    //delete the history if the user logged in so that it will not go back to login screen on android and ios device
    $ionicHistory.clearHistory();

    _self.images = [];
    //var fbAuth = fb.getAuth();
    var fb = $firebaseAuth(authFactory.ref);
    var fbAuth = fb.$getAuth();

    if (fbAuth) {
      //var userRef = fb.child("users/" + fbAuth.uid);
      //var userRef = authFactory.child("users/" + fbAuth.uid);
      var userRef = authFactory.ref.child("users/" + fbAuth.uid);
      var syncArray = $firebaseArray(userRef.child("images"));
      _self.images = syncArray;
    } else {
      $state.go("firebase");
    }

    _self.upload = function () {
      var options = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false,
        correctOrientation : true
      };

      $cordovaCamera.getPicture(options)
        .then(function (imageData) {
          syncArray.$add({image: imageData}).then(function () {
            alert("Image Saved");
          });
          /*syncArray.$add({image: imageData}).then(function () {
           alert("Image has saved");
           })*/
        }, function (error) {
          console.error("error ", error);
        })
    };
    _self.uploadPicture = function(){
      var options = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        targetWidth: 500,
        targetHeight: 500,
        saveToPhotoAlbum: false,
        correctOrientation : true
      };
      $cordovaCamera.getPicture(options)
        .then(function(imageData){
          //_self.image = "data:image/jpeg;base64," + imageData;
          syncArray.$add({image : imageData}).then(function(){
            alert("Image Saved");
          })
        },function(error){
          console.error("Get picture Camera Error " , error);
        })
    };
  }])
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  });
