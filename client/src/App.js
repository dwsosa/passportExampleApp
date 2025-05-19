import logo from './logo.svg';
import './App.css';

function handleLogin() {
  const username = document.querySelector('input[type="text"]').value;
  const password = document.querySelector('input[type="password"]').value;

  fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        // Store the token in local storage
        localStorage.setItem('token', data.token);
        alert('Login successful!');
      } else {
        alert('Login failed!');
      }
    })
    .catch(error => console.error('Error:', error));
}

const handleRegistration= async(event) =>{
  event.preventDefault();
  const username = document.querySelector('input[type="text"]').value;
  const password = document.querySelector('input[type="password"]').value;

  fetch('http://localhost:5000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        alert('Registration successful!');
      } else {
        alert('Registration failed!');
      }
    })
    .catch(error => console.error('Error:', error));
}



function App() {
  return (
    <div className="App">
      <input type="text" placeholder="Username" />
      <input type="password" placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegistration}>Register</button>
    </div>
  );
}

export default App;
