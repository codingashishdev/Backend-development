import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios';

function App() {
  const [jokes, setJokes] = useState({});

  useEffect(()=>{
      axios.get('https://localhost:3000/api/jokes')
        .then((response)=>{
          setJokes(response.data);
        })
        .catch((err)=>{
          console.log(err);
        })
  })

  return (
    <>
      <h1>Ashish Prajapati</h1>
      <p>JOKES: {jokes.length}</p>

      {
          jokes.map((joke, index)=>{
            <div key={joke.id}>
                <h3>{joke.title}</h3>
                <h4>{joke.content}</h4>
            </div>
          })
      }
    </>
  )
}

export default App
