/**
 * Created by xixi on 15/6/13.
 */

var mongodb = require('./db');

function User(user){

    this.username = user.username;
    this.password = user.password;
    this.email = user.email;

};

module.exports = User;

User.prototype.save = function (callback) {

    //store user into mongod
    var user={
        username: this.username,
        password: this.password,
        email: this.email
    };

    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }

        //read user
        db.collection('users', function (err, collection) {

            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(user,{
                safe: true
            }, function(err, user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, user[0]);
            });
        });
    });
};

User.get = function(username, callback){

    //open mongo
    mongodb.open(function(err, db){
        if(err){
            return callback(err);
        }

        //read user collection
        db.collection('users', function(err, collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //find name
            collection.findOne({
                username: username
            }, function(err, user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null, user);
            });
        });

    });

};
