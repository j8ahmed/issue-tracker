/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'issue_title');
          assert.property(res.body, 'issue_text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'created_by');
          assert.property(res.body, 'assigned_to');
          assert.property(res.body, 'open');
          assert.property(res.body, 'status_text');
          assert.property(res.body, '_id');          
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Issue Title',
            issue_text: 'Issue Text',
            created_by: 'Created by Test'
          })
          .end( (err, res)=>{
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'issue_title');
            assert.property(res.body, 'issue_text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'updated_on');
            assert.property(res.body, '_id');       
            assert.equal(res.body.issue_title, 'Issue Title');
            assert.equal(res.body.issue_text, 'Issue Text');
            assert.equal(res.body.created_by, 'Created by Test');
            done();
          });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Issue Tile',
            issue_text:  '',
            created_by:  ''
          })
          .end((err, res)=>{
          //I am not entirely sure what should happen here because the html form would not allow a post request without the required fields.
            assert.equal(res.body, 'Missing required fields');
            done();
          });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: "5bf5327564119c15bd47dfea",
            issue_title: '',
            issue_text: '',
            created_by: '',
            assigned_to: '',
            status_text: ''
          })
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no updated field sent');
            done();
          });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: "5bf5327564119c15bd47dfea",
            issue_title: 'I am rewriting the Issue Title'
          })
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body, 'successfully updated');
            done();
          });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: "5bf5327564119c15bd47dfea",
            issue_title: 'Updated issue Title',
            issue_text: 'Updated issue Text',
            created_by: 'Updater chai test',
          })
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body, 'successfully updated');
            done();
          });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            issue_title: 'second issue'
          })
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.equal(res.body[0]['issue_title'], 'second issue');
            done();
          });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            issue_title: 'second issue',
            open: 'true'
          })
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'open');
            assert.equal(res.body[0]['issue_title'], 'second issue');
            assert.equal(res.body[0]['open'], 'true');
          });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body, 'could not delete ')
            done();        
          });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: '5bf5327564119c15bd47dfea' })
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.body, 'deleted 5bf5327564119c15bd47dfea');
          });
      });
      
    });

});
