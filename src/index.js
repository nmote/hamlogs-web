import React from 'react';
import {render} from 'react-dom';
import {CSVToAdif, CSVToSOTA} from 'hamlogs';

function dateString(str) {
  return str == null ? '' : ('_' + str);
}

class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {errors: null};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  downloadFile(filename, text) {
    const aNode = document.createElement('a');
    const blob = new Blob([text], {type: 'text/plain'});
    aNode.href = URL.createObjectURL(blob);
    aNode.download = filename;
    document.body.appendChild(aNode);
    aNode.click();
    document.body.removeChild(aNode);
  }

  handleSubmit(program, callsign, entity, csvText) {
    if (program === 'POTA') {
      const adifResult = CSVToAdif(callsign, entity, csvText);

      if (adifResult.kind === 'err') {
        this.setState({errors: adifResult.err});
        return;
      }

      this.setState({errors: null});

      const adif = adifResult.value.text;
      const {earliestEntryDate} = adifResult.value;

      this.downloadFile(`${callsign}@${entity}${dateString(earliestEntryDate)}.adi`, adif);
    } else {
      const SOTAResult = CSVToSOTA(callsign, entity, csvText);

      if (SOTAResult.kind === 'err') {
        this.setState({errors: SOTAResult.err});
        return;
      }

      this.setState({errors: null});

      const csvOut = SOTAResult.value.text;
      const {earliestEntryDate} = SOTAResult.value;

      this.downloadFile(`${callsign}@${entity}${dateString(earliestEntryDate)}.csv`, csvOut);
    }
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}/>
        <ErrorDisplay errors={this.state.errors}/>
      </div>
    );
  }
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      callsign: '',
      entity: '',
      file: null,
      program: 'POTA',
    };

    this.handleCallsignChange = this.handleCallsignChange.bind(this);
    this.handleEntityChange = this.handleEntityChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleProgramChange = this.handleProgramChange.bind(this);
  }

  handleProgramChange(event) {
    this.setState({program: event.target.value});
  }

  handleFileChange(event) {
    this.setState({file: event.target.files[0]});
  }

  handleCallsignChange(event) {
    this.setState({callsign: event.target.value});
  }

  handleEntityChange(event) {
    this.setState({entity: event.target.value});
  }

  handleSubmit(event) {
    const reader = new FileReader();

    const program = this.state.program;
    const callsign = this.state.callsign;
    const entity = this.state.entity;

    reader.onload = (evt) => {
      this.props.onSubmit(program, callsign, entity, evt.target.result);
    };
    reader.readAsText(this.state.file);
    event.preventDefault();
  }

  entityText() {
    if (this.state.program === 'POTA') {
      return 'Your park:';
    } else {
      return 'Your summit:';
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <input type="radio" value="POTA" checked={this.state.program === 'POTA'} onChange={this.handleProgramChange} />
          POTA
        </label>
        <br/>
        <label>
          <input type="radio" value="SOTA" checked={this.state.program === 'SOTA'} onChange={this.handleProgramChange} />
          SOTA
        </label>
        <hr/>
        <label>
          Your callsign:
          <input type="text" value={this.state.callsign} onChange={this.handleCallsignChange} />
        </label>
        <br/>
        <label>
          {this.entityText()}
          <input type="text" value={this.state.entity} onChange={this.handleEntityChange} />
        </label>
        <br/>
        <label>
          CSV File (<a href="https://raw.githubusercontent.com/nmote/hamlogs/main/fixtures/K-4531%2CW7W_CH-227.csv">example</a>):
          <input type="file" onChange={this.handleFileChange} />
        </label>
        <br/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

class ErrorDisplay extends React.Component {
  render() {
    if (this.props.errors == null) {
      return null;
    }

    return (
      <div>
        Could not convert the log due to the following errors:
        <ul>
          {this.props.errors.map((err, i) => (<li key={i}>{err}</li>))}
        </ul>
      </div>);
  }
}

render(
  <Root/>,
  document.getElementById('root')
);
