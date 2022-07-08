'use strict';

const e = React.createElement;

class Select extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    return (
    <div class="form-group">
          <label class="col-md-4 control-label"></label>  
            <div class="col-md-4 inputGroupContainer">
            <div class="input-group">
              <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
              <select id="make" name="make" class="form-control" >
                </select>
              </div>
            </div>
        </div>
    );
  }
}

// const domContainer = document.getElementById('test-div');
const domContainer = document.querySelector('#like_button_container');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Select));