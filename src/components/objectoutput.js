// projects component - responsible for listing all of the projects
import React, { Component } from 'react';
import JSONPretty from 'react-json-pretty';

const styles = {
  outputblock: {
    clear: 'both',
    float: 'left',
    marginTop: 20
  }
}

class Objectoutput extends Component {

  render() {

    return (
      <div id="objectoutput" style={styles.outputblock} className="Objectoutput">
        <JSONPretty id="json-pretty" json={this.props.displayjson}></JSONPretty>
      </div>
    );
  }
}

export default Objectoutput;
