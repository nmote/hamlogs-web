import React from 'react';
import {render} from 'react-dom';
import {CSVToAdif} from 'hamlogs';

class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {outputText: null};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(callsign, park, csvText) {
    // TODO handle error
    const adif = CSVToAdif(callsign, park, csvText).value;
    this.setState({outputText: adif});
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.handleSubmit}/>
        <OutputArea text={this.state.outputText}/>
      </div>
    );
  }
}

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      callsign: '',
      park: '',
      file: null,
    };

    this.handleCallsignChange = this.handleCallsignChange.bind(this);
    this.handleParkChange = this.handleParkChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleFileChange(event) {
    this.setState({file: event.target.files[0]});
  }

  handleCallsignChange(event) {
    this.setState({callsign: event.target.value});
  }

  handleParkChange(event) {
    this.setState({park: event.target.value});
  }

  handleSubmit(event) {
    const reader = new FileReader();

    const callsign = this.state.callsign;
    const park = this.state.park;

    reader.onload = (evt) => {
      this.props.onSubmit(callsign, park, evt.target.result);
    };
    reader.readAsText(this.state.file);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Your callsign:
          <input type="text" value={this.state.callsign} onChange={this.handleCallsignChange} />
        </label>
        <br/>
        <label>
          Your park:
          <input type="text" value={this.state.park} onChange={this.handleParkChange} />
        </label>
        <br/>
        <label>
          CSV File (<a href="https://raw.githubusercontent.com/nmote/hamlogs/main/fixtures/K-3213.csv">example</a>):
          <input type="file" onChange={this.handleFileChange} />
        </label>
        <br/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

class OutputArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.text == null) {
      return null;
    }

    return <textarea value={this.props.text} disabled={true} />
  }
}

render(
  <Root/>,
  document.getElementById('root')
);
