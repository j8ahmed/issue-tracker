/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; 

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    
    .get(function (req, res){
      var project = req.params.project;
      
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        if(err) return console.log(err);
        console.log('I have successfuly connected to my database.');
        
        console.log(req.query);
        
        db.collection(project).find(req.query).toArray((err, result)=>{
          res.send(result);  
        });
        
      });
    })
    
    .post(function (req, res){
      var project = req.params.project;
      let newIssue;
    
      let hasRequiredFields = true;
      let requiredFields = ['issue_title', 'issue_text', 'created_by'];
      for(let i=0; i<requiredFields.length; i++){
        if(req.body[requiredFields[i]] == '') hasRequiredFields = false;
      }
    
      if(hasRequiredFields){
    
        MongoClient.connect(CONNECTION_STRING, function(err, db) {

          if(err) return console.log(err);

          console.log('I have successfuly connected to my database.');

          db.collection(project).insert({
            issue_title: req.body.issue_title,
            issue_text:  req.body.issue_text,
            created_on:  new Date(),
            updated_on:  new Date(),
            created_by:  req.body.created_by,
            assigned_to: req.body.assigned_to,
            open:        "true",
            status_text: req.body.status_text
          }, {}, function(err, cursor){
            if(err) console.log(err);
            //Output the new issue with all of the fields stored in the database
            res.json(cursor.ops[0]);
          });

        });
      }else res.send('Missing required fields');
    })
    
    .put(function (req, res){
      var project = req.params.project;
      
      let emptyChecker = true;
      //Check if there is any content to update
      let updateProps = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
      for(let i=0; i<updateProps.length;i++){
        if(req.body[updateProps[i]] != '' || req.body.open) emptyChecker = false;
      }
            
      
      if(emptyChecker) res.send('no updated field sent');
      else{
        
        //Check if the _id meets the minimum requirements 13 character string or 26 character string
        if(req.body._id.length == 24){
          
          MongoClient.connect(CONNECTION_STRING, function(err, db) {
          if(err) return console.log(err);
          
          //check if the document with the _id in the request exists
          let documentExists = true;
          db.collection(project).find({_id: ObjectId(req.body._id)}, {strict: true}).toArray((err, result)=>{
            if(err) {
              console.log(err);
              res.send("could not update "+req.body._id);
            }
            
            console.log(result);
            if(result[0]){
              // console.log("there is a result from the db query.");
              documentExists = true;
            }else{
              // console.log("there is not a result from the query.");  
              documentExists = false;
            }
            
          });
          
          if(!documentExists){
            res.send("could not update "+req.body._id);
          }else{

            let updateFields = {};
            //Add fields if they are not blank in the request body.
            updateProps = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];
            for(let i = 0; i < updateProps.length; i++){
              if(req.body[updateProps[i]] != '') updateFields[updateProps[i]] = req.body[updateProps[i]];
            }
            //check if the radio is set to close the issue
            if(req.body.open) updateFields.open = 'false';
            updateFields.updated_on = new Date();
            
            db.collection(project).update({_id: ObjectId(req.body._id)}, {$set: updateFields}, {}, (err, result)=>{
              if(err) console.log(err);
              
              //update was successful
              res.send('successfully updated');
            });
          }
        });
          
          
        }else res.send("could not update "+req.body._id);
      }
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
      //Check if the _id meets the length requirements
      if(req.body._id.length == 24){

        MongoClient.connect(CONNECTION_STRING, function(err, db) {
          //Check if the _id exists for a doc in the database
          let documentExists = false;
          db.collection(project).find({_id: ObjectId(req.body._id)}).toArray((err, result)=>{
            if(err) return console.log(err);

            documentExists = result[0] ? true : false;
          });


          if(documentExists){

            //Delete the document matching the _id
            db.collection(project).removeOne({_id: ObjectId(req.body._id)}, (err, result)=>{
              if(err) return console.log(err);
              res.send('deleted '+req.body._id);
            });

          }else res.send('could not delete '+req.body._id);

        });

      }else res.send('could not delete '+req.body._id);
        
    
    });
    
};
