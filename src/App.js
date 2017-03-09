import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import {deepOrange500} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Tabs, Tab} from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import Toggle from 'material-ui/Toggle';
import Objectoutput from './components/objectoutput';
import $ from 'jquery';
import './App.css';
import JSONPretty from 'react-json-pretty';


var testObjF = {
  "firstName": "John",
  "lastName": "Green",
  "car": {
    "make": "Honda",
    "model": "Civic",
    "revisions": [
      { "miles": 10150, "code": "REV01", "changes": "test" },
      { "miles": 20021, "code": "REV02", "changes": [
        { "type": "asthetic", "desc": "Left tire cap" },
        { "type": "mechanic", "desc": "Engine pressure regulator" }
      ] }
    ]
  },
  "visits": [
    { "date": "2015-01-01", "dealer": "DEAL-001" },
    { "date": "2015-03-01", "dealer": "DEAL-002" }
  ]
};

var testObjUf = {
    "firstName": "John",
    "lastName": "Green",
    "car.make": "Honda",
    "car.model": "Civic",
    "car.revisions.0.miles": 10150,
    "car.revisions.0.code": "REV01",
    "car.revisions.0.changes": "ttt",
    "car.revisions.1.miles": 20021,
    "car.revisions.1.code": "REV02",
    "car.revisions.1.changes.0.type": "asthetic",
    "car.revisions.1.changes.0.desc": "Left tire cap",
    "car.revisions.1.changes.1.type": "mechanic",
    "car.revisions.1.changes.1.desc": "Engine pressure regulator",
    "visits.0.date": "2015-01-01",
    "visits.0.dealer": "DEAL-001",
    "visits.1.date": "2015-03-01",
    "visits.1.dealer": "DEAL-002"
}

// create a placeholder for the formatted output objects
var outputFlatObj = {},
    outputUnFlatObj = {};

var flatten = function(obj, keyname, flattenedkey) {

  //combine keys of nested objects into one string
  var newflattenedkey = (typeof flattenedkey !== 'undefined' && flattenedkey !== '') ? flattenedkey + '.' + keyname : keyname;

  //loop thorugh the input object properties
  for (var p in obj) {
    // check the type of each value
    // if the type is not an object, it can be written to the output object immediately
    if (typeof obj[p] !== 'object') {
      if(keyname){
         outputFlatObj[newflattenedkey + '.' + p] = obj[p];
      }else{
        outputFlatObj[p] = obj[p];
      }
    }else{
      // process nested object by reinvoking flatten
      flatten(obj[p], p, newflattenedkey);
    }
  }
  return outputFlatObj;
};

var unflatten = function(obj) {

  var isAnIndex = function(seg) {
    var isIndex = parseInt(seg);
    if(isNaN(isIndex)) {
      return -1;
    }else{
      return 1;
    }
  }

  //loop thorugh the input object properties
  for (var p in obj) {
    //if the key name contains dot notation, indicating nested objects, split them for further processing
    if(p.indexOf('.') > -1){
      let keySegments = [];
      keySegments = p.split(".");

      //create variable to hold the parent node in context
      let thisParentNode = outputUnFlatObj;

      //loop through keySegments and create objects or arrays as needed
      //todo: figure out a way to optimize this process
      for(let i = 0; i < keySegments.length; i++) {

        // if first element in segment, align to output object root
        if(i === 0){
          //check if node exists if not add to root output object
          let nodeExists = outputUnFlatObj.hasOwnProperty(keySegments[i]);
          if(!nodeExists){
            //if the next segment element is a number, create node as an array
            if(isAnIndex(keySegments[i + 1]) > 0) {
              outputUnFlatObj[keySegments[i]] = [];
            //otherwise just create an empty object
            }else{
              outputUnFlatObj[keySegments[i]] = {};
            }
          }
          //set the new parent node
          thisParentNode = outputUnFlatObj[keySegments[i]];
        }else{
          //if this segment is a number, then add the next element
          //to the array at the index indicated by the current segment
          if(isAnIndex(keySegments[i]) > 0) {
            //add value at specified index
            let elemToAdd = (keySegments[i + 1]) ? keySegments[i + 1] : obj[p];
            //if the next segment is the last one, add it as an object to the array
            if(i === (keySegments.length - 2)){
              let elemKey = keySegments[i + 1];
              let elemToAdd = {};
              //if another object already exists at this index, add the property to that
              if(typeof thisParentNode[parseInt(keySegments[i])] == 'object'){
                thisParentNode[parseInt(keySegments[i])][keySegments[i + 1]] = obj[p];
              }else{
                //otherwise add an empty object and populate it
                thisParentNode.splice(parseInt(keySegments[i]), 0, elemToAdd);
                thisParentNode[parseInt(keySegments[i])][keySegments[i + 1]] = obj[p];
              }

            }else{
              //if the segment after the one being added to the current array
              //element is a number, create this node as an array also
              if(isAnIndex(keySegments[i + 2]) > 0) {
                //if another object already exists at this index, add the property to that
                //also check to see if that object is an array so we dont overwrite it
                if((typeof thisParentNode[parseInt(keySegments[i])] == 'object') &&
              (thisParentNode[parseInt(keySegments[i])].length)){
                  thisParentNode[keySegments[i]][keySegments[i + 1]] = [];
                }
              //otherwise just add the value to the array
              }else{
                thisParentNode.splice(parseInt(keySegments[i]), 0, elemToAdd);
              }
              thisParentNode = thisParentNode[keySegments[i]];

            }
          }else{
            //if it's the last array element, go ahead and assign the value to the node
            if(i === keySegments.length - 1) {
              thisParentNode[keySegments[i]] = obj[p];
            }else{
              //otherwise set the current node to an obj, if it doesn't alredy exist
              if(thisParentNode.hasOwnProperty(keySegments[i]) !== true) {
                //if the next segment element is a number, create node as an array
                if(isAnIndex(keySegments[i + 1]) > 0) {
                  thisParentNode[keySegments[i]] = [];
                //otherwise just create an empty object
                }else{
                  thisParentNode[keySegments[i]] = {};
                }
              }
              thisParentNode = thisParentNode[keySegments[i]];
            }
          }
        }
      }

    }else{
     //no dot notation - create top-level object property
     outputUnFlatObj[p] = obj[p];
    }
  }
  return outputUnFlatObj;
};

var textinputplaceholder = '{\r\n  \"firstName\": \"John\",\r\n  \"lastName\": \"Green\",\r\n  \"car\": {\r\n    \"make\": \"Honda\",\r\n    \"model\": \"Civic\",\r\n    \"revisions\": [\r\n      { \"miles\": 10150, \"code\": \"REV01\", \"changes\": \"test\" },\r\n      { \"miles\": 20021, \"code\": \"REV02\", \"changes\": [\r\n        { \"type\": \"asthetic\", \"desc\": \"Left tire cap\" },\r\n        { \"type\": \"mechanic\", \"desc\": \"Engine pressure regulator\" }\r\n      ] }\r\n    ]\r\n  },\r\n  \"visits\": [\r\n    { \"date\": \"2015-01-01\", \"dealer\": \"DEAL-001\" },\r\n    { \"date\": \"2015-03-01\", \"dealer\": \"DEAL-002\" }\r\n  ]\r\n}';
var textinputplaceholderuf = '{\r\n    \"firstName\": \"John\",\r\n    \"lastName\": \"Green\",\r\n    \"car.make\": \"Honda\",\r\n    \"car.model\": \"Civic\",\r\n    \"car.revisions.0.miles\": 10150,\r\n    \"car.revisions.0.code\": \"REV01\",\r\n    \"car.revisions.0.changes\": \"ttt\",\r\n    \"car.revisions.1.miles\": 20021,\r\n    \"car.revisions.1.code\": \"REV02\",\r\n    \"car.revisions.1.changes.0.type\": \"asthetic\",\r\n    \"car.revisions.1.changes.0.desc\": \"Left tire cap\",\r\n    \"car.revisions.1.changes.1.type\": \"mechanic\",\r\n    \"car.revisions.1.changes.1.desc\": \"Engine pressure regulator\",\r\n    \"visits.0.date\": \"2015-01-01\",\r\n    \"visits.0.dealer\": \"DEAL-001\",\r\n    \"visits.1.date\": \"2015-03-01\",\r\n    \"visits.1.dealer\": \"DEAL-002\"\r\n}';

const styles = {
  container: {
    paddingTop: 0
  },
  contentcontainer: {
    paddingLeft: 50,
    marginTop: 20
  },
  inputcontainer: {
    float: 'left',
    width: '50%'
  },
  outputcontainer: {
    marginLeft: 35,
    float: 'left',
    color: '#4CC552',
    fontSize: 15
  },
  button: {
    marginTop: 20
  },
  block: {
    maxWidth: 250,
    float: 'left'
  },
  textinput:{
    fontSize: 15
  },
  toggle: {
    marginBottom: 16,
    marginTop: 23,
    marginLeft: 23,
    fontSize: 14
  },
  thumbOff: {
    backgroundColor: '#ffcccc',
  },
  trackOff: {
    backgroundColor: '#ff9d9d',
  },
  thumbSwitched: {
    backgroundColor: 'red',
  },
  trackSwitched: {
    backgroundColor: '#ff9d9d',
  },
  labelStyle: {
    color: 'red',
  },
  inputsublabel: {
    color: '#555'
  }
};

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
});

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
      displayjson: {},
      inputvalue: textinputplaceholder,
      processtype: 'flatten',
      textinputplaceholder: textinputplaceholder
    };

    this.handleChange = this.handleChange.bind(this);

  }

  handleToggle = () => {
    if(this.state.processtype == 'flatten'){
      this.setState({
        processtype: 'unflatten',
        inputvalue: textinputplaceholderuf,
        textinputplaceholder:textinputplaceholderuf
      });
    }else{
      this.setState({
        processtype: 'flatten',
        inputvalue: textinputplaceholder,
        textinputplaceholder:textinputplaceholder
      });
    }
  }

  handleChange(event) {
    this.setState({inputvalue: event.target.value});
  }

  handleTouchTap = () => {
    let inputObj = JSON.parse(this.state.inputvalue);
    let returnedjson = {};
    if(this.state.processtype == 'flatten'){
      returnedjson = flatten(inputObj);
    }else{
      returnedjson = unflatten(inputObj);
    }

    this.setState({
      displayjson: returnedjson,
    });
  }

  render() {
    const standardActions = (
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleRequestClose}
      />
    );

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div style={styles.container}>
          <AppBar
            title="JSON Flattener & Unflattener with ReactJS & Material UI"
            iconClassNameRight="muidocs-icon-navigation-expand-more"
          />
        <div style={styles.contentcontainer}>
          <div style={styles.inputcontainer}>
            <h2 style={styles.inputsublabel}>JSON Input</h2>
            <TextField
              name="jsoninput"
              hintText="Enter JSON here"
              multiLine={true}
              rows={20}
              rowsMax={64}
              fullWidth={true}
              value={this.state.inputvalue}
              onChange={this.handleChange}
              style={styles.textinput}
              placeholder={this.state.textinputplaceholder}
            /><br />
              <div style={styles.block}>
                <RaisedButton
                  label="Process"
                  secondary={true}
                  onTouchTap={this.handleTouchTap}
                  style={styles.button}
                />
              </div>
              <div style={styles.block}>
                <Toggle
                  label="Flatten / Unflatten"
                  labelPosition="right"
                  style={styles.toggle}
                  onToggle={this.handleToggle}
                />
              </div>
            </div>
            <div style={styles.outputcontainer}>
              <h2>Result</h2>
              <Objectoutput
                displayjson={this.state.displayjson}
              />
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
