import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/Home/home';
import Test from "./pages/Home/home";
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
