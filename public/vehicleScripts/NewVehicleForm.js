'use strict';
const e = React.createElement;

class NewVehicleForm extends React.Component {
    render(){
        return (
        <div>
            <p>React Test Element</p>
        </div>     
       )
    }
};


const domContainer = document.getElementById('new-vehicle-div');
const root = ReactDOM.createRoot(domContainer);
root.render(e(NewVehicleForm));