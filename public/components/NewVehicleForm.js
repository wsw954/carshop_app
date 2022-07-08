'use strict';
const e = React.createElement;


class NewVehicleForm extends React.Component {
    constructor(props) {
      super(props)
      this.state = { 
        formValues: [{ name: "", email : "" }]
       };
      
      this.handleSubmit = this.handleSubmit.bind(this)
    }


    componentDidMount() {
    // GET request using fetch with set headers
    fetch('/makes')
        .then(response => response.json())
        .then(data => console.log(data));
}

    handleChange(i, e) {
      let formValues = this.state.formValues;
      formValues[i][e.target.name] = e.target.value;
      this.setState({ formValues });
    }
  
    addFormFields() {
        console.log(this.state.formValues)
      this.setState(({
        //JS spread operator (...) used here
        formValues: [...this.state.formValues, { name: "", email: "" }]
      }))
    }
    
 
    removeFormFields(i) {
      let formValues = this.state.formValues;
      formValues.splice(i, 1);
      this.setState({ formValues });
    }
  
    handleSubmit(event) {
      event.preventDefault();
      alert(JSON.stringify(this.state.formValues));
    }
  
    render() {
  
      return (
        <form  onSubmit={this.handleSubmit}>
        {this.state.formValues.map((element, index) => (
          <div className="form-inline" key={index}>
            <label>Name</label>
            <input type="text" name="name" value={element.name || ""} onChange={e => this.handleChange(index, e)} />
            <label>Email</label>
            <input type="text" name="email" value={element.email || ""} onChange={e => this.handleChange(index, e)} />
            {
              index ? 
                <button type="button"  className="button remove" onClick={() => this.removeFormFields(index)}>Remove</button> 
              : null
            }
          </div>
        ))}
        <div className="button-section">
            <button className="button add" type="button" onClick={() => this.addFormFields()}>Add</button>
            <button className="button submit" type="submit">Submit</button>
        </div>
    </form>
      );
    }
  }


const domContainer = document.getElementById('root');
const root = ReactDOM.createRoot(domContainer);
root.render(e(NewVehicleForm));
