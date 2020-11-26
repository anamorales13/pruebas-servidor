import logo from './logo.svg';
import './App.css';
import Primera from './primera';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Primera/>
       
      </header>
    </div>
  );
}

export default App;
