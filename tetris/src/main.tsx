import React from 'react'
import ReactDOM from 'react-dom/client'
import Tetris from './components/Tetris/Tetris'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Tetris />
  </React.StrictMode>,
)
