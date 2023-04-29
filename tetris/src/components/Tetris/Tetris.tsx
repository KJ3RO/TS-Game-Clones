import React, {useEffect, useReducer, useRef} from "react";
import './Tetris.css'

const TETROMINOS: number[][][] = [
  [
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
  ],
  [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
  ],
  [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
  ],
  [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
  ],
  [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
  ],
  [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
  ],
];
const LENGTH: number = 4;
const GAME_STATUS: {GameOver: boolean} = {
  GameOver: false,
}

const ACTION: {Restart: string, Move: string, TimeOver: string}  = {
  Restart: "RESTART",
  Move: "MOVE",
  TimeOver: "TIMEOVER",
}

const SPEED: number = 1000;

const BOARD: {width: number, height: number} = {
  width: 10,
  height: 20,
}

const KEYPRESS: {Left: number, Right: number, Down: number, Rotate: number, Drop: number, Switch: number, Pause: number} = {
  Left: 37,
  Right: 39,
  Down: 40,
  Rotate: 38,
  Drop: 32,
  Switch: 67,
  Pause: 27,
}

const VALIDKEYS: number[] = [KEYPRESS.Pause, KEYPRESS.Switch, KEYPRESS.Down, KEYPRESS.Right, KEYPRESS.Left, KEYPRESS.Drop, KEYPRESS.Rotate];

function getInitialState(): {status: boolean, position: {x: number, y: number}, tetromino: any, board: any } {
  return {
    status: !GAME_STATUS.GameOver,
    position: {
      x: Math.floor(BOARD.width / 2 ) - 1,
      y: 0,
    },
    tetromino: TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)],
    board: [...Array(BOARD.height)].map(x => Array(BOARD.width).fill(0)),
  }
}

function checkCollision(board: any, tetromino: any, position: any): true | undefined {
  for (let y: number = 0; y < LENGTH; y++) {
    for (let x: number = 0; x < LENGTH; x++) {
      if ((tetromino[y][x] !== 0) || ((((x + position.x) < 0 || (x + position.x) >= BOARD.width) || ((y + position.y) >= BOARD.height) || ((board[y + position.y][x + position.x]) !== 0))))
        return true;
    }
  }
}

function rotateTetromino(matrix: any) {
  return (matrix[0].map((val: any, index: any): void => {
    matrix.map((row: { [x: number]: any; }) => row[index]).reverse()
  }));
}

function handleGameControl(state: any, action: any) {
  const a = action.type;
  if (a == ACTION.Restart) return {...getInitialState()};
  else if (a == ACTION.Move) {
    const key = action.keyCode;
    if (key == KEYPRESS.Left) {
      if (!checkCollision(state.board, state.tetromino, {x: state.position.x - 1, y: state.position.y}))
        return {...state, position: {x: state.position.x - 1, y: state.position.y}};
    } else if (key == KEYPRESS.Right) {
      if (!checkCollision(state.board, state.tetromino, {x: state.position.x + 1, y: state.position.y}))
        return {...state, position: {x: state.position.x + 1, y: state.position.y}};
    } else if (key == KEYPRESS.Down) {
      if (!checkCollision(state.board, state.tetromino, {x: state.position.x, y: state.position.y + 1}))
        return {...state, position: {x: state.position.x, y: state.position.y + 1}};
    } else if (key == KEYPRESS.Rotate) {
      if (!checkCollision(state.board, rotateTetromino(state.tetromino), state.position))
        return {...state, tetromino: rotateTetromino(state.tetromino)};
    }
  } else if (a == ACTION.TimeOver) {
    let tempY = state.position.y + 1;
    if (checkCollision(state.board, state.tetromino, {x: state.position.x, y: tempY})) {
      if (state.position.y == 0)
        return {...state, status: GAME_STATUS.GameOver};
      let tempBoard: any[] = [...state.board];
      for (let y: number = 0; y < state.tetromino.length; y++) {
        for (let x: number = 0; x < state.tetromino[y].length; x++) {
          if (state.tetromino[y][x] !== 0)
            tempBoard[y + state.position.y][x + state.position.x] = state.tetromino[y][x];
        }
      }
      let completedRow: any[] = []
      for(let y: number = 0; y < BOARD.height; y++) {
        if (completedRow[y] != 0)
          completedRow.push(y);
      }
      completedRow.sort().reverse().forEach(completedRow => { tempBoard.splice(completedRow,1) });
      for (let i: number = 0; i < completedRow.length; i++)
        tempBoard.unshift(Array(BOARD.width).fill(0));
      return { ... getInitialState(), board: tempBoard};
    }
    return {...state, position: {x: state.position.x, y: tempY} };
  }
  return {...state};
}


function useInterval(callback: any, delay: any): void {
  const savedCallback: React.MutableRefObject<any> = useRef(callback)
  useEffect((): void => { savedCallback.current = callback }, [callback])
  useEffect(() => {
    if (delay == null) return;
    const timer: NodeJS.Timer = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(timer)
  }, [delay])
}

export default function Tetris(): JSX.Element {
  let [state, modify] = useReducer(handleGameControl, getInitialState() );
  useInterval((): void => { modify({type: ACTION.TimeOver}) }, state.status !== GAME_STATUS.GameOver ? SPEED : 0);
  useEffect(() => { document.addEventListener('keydown', handleGameAction); return (): void => {
    document.removeEventListener('keydown', handleGameAction);
  }});
  console.log(state.board);

  function handleGameAction(e: any): void {
    for(let i: number = 0; i < VALIDKEYS.length; i++) {
      if ([VALIDKEYS[i]].includes(e.keyCode) ) {
        e.preventDefault();
        modify({type: ACTION.Move, keyCode: e.keyCode});
      }
    }
  }

  let out: any[] = [], draw: any[] = [];
  for (let y: number = 0; y < BOARD.height; y++) {
    draw[y] = [];
    for (let x: number = 0; x < BOARD.width; x++) {
      console.log(state);
      if(state.board[y][x] === 0)
        draw[y][x] = <div style={{ width:30, height:30, display: 'inline-block', background: "black", border: '1px solid grey'}} />;
      else
        draw[y][x] = <div style={{ width:30, height:30, display: 'inline-block', background: "white", border: '1px solid grey'}} />;
    }
    out.push(<div style={{display: 'block', lineHeight: 0}} key={y}>{[...draw[y]]}</div>);
  }

  return (
  <React.Fragment>
    <div className="container">
      <div className="card">
        <h1>TETRIS</h1>
        { state.status === GAME_STATUS.GameOver && <div><button onClick={()=>modify({type: ACTION.Restart})}>Game Over! Play again</button></div>}
        <div className="Game">{out}</div>
      </div>
    </div>
  </React.Fragment>); 
}