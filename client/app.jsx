import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Row from './components/row.jsx';
import Popup from './components/popup.jsx';
import Password from './components/password.jsx';
import levels from './components/Levels.js';
const levelArray = Object.keys(levels);

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            level: 0,
            fullBoard: [],
            boardView: [],
            broRight: true,
            boardLocation: { //top left
                row: 0,
                col: 0
            }, 
            shiftDown: false,
            viewLocation: { //top left
                row: 0,
                col: 0
            },
            brocation: {
                row: 0,
                col: 0
            },
            doorLocation: {
                row: 0,
                col: 0
            },
            start: true,
            pswdScreen: true,
            lastPasswordKey: ''
        }
        
        this.move = this.move.bind(this);
    }

    componentDidMount() {
        this.mountLevel();
        document.addEventListener("keydown", (event) => { 
            if (event.target.nodeName == 'INPUT') {
                this.passwordHandler(event);
                return;
            }
            this.move(event)
        });
        document.addEventListener("keyup", (event) => {
            this.shift(event)
        });
    }

    passwordHandler(event) {
        if (event.key === 'Enter') {
            if (this.state.lastPasswordKey === 'Enter') {
                this.move(event);
            }

            for (let lvl = 0; lvl < levelArray.length; lvl++) {
                if (levels[levelArray[lvl]].password === event.target.value) {
                    event.target.value = 'Kubernetes!'

                    setTimeout(() => {
                        this.setState({ level: lvl, pswdScreen: false }, () => {
                            this.mountLevel();
                        })
                    }, 500)
                    return;
                }
            }

            event.target.value = ''
            this.setState(() => {
                return { lastPasswordKey: 'Enter' };
            });
        } else {
            return;
        }
    }


    turnToBrick(e, row, index) {
        let newBoard = this.state.boardView.slice();
        newBoard[row][index] = './images/brick.png';
        this.setState(() => { return {boardView: newBoard }});
    }

    shift(event) {
        if (event.shiftKey === false && this.state.shiftDown === true) {
            let newView = [];

            for (let i = this.state.boardLocation.row; i < this.state.boardLocation.row + 12; i++) {
                newView.push(this.state.fullBoard[i].slice(this.state.boardLocation.col, this.state.boardLocation.col + 18));
            }

            this.setState({shiftDown: false, boardView: newView});
        }
    }
    
    mountLevel() {
        //copy each element individually into new matrix to avoid updating level object
        let newFullBoard = (() => {
            let matrixCopy = [];
            for (let i = 0; i < levels[levelArray[this.state.level]].board.length; i++) {
                let row = [];
                for (let j = 0; j < levels[levelArray[this.state.level]].board[i].length; j++) {
                    row.push(levels[levelArray[this.state.level]].board[i][j]);
                }
                matrixCopy.push(row);
            }
            return matrixCopy;
        })()

        let newBoard = [];
        for (let i = newFullBoard.length - 12; i < newFullBoard.length; i++) {
            newBoard.push(newFullBoard[i].slice(-18));
        }

        let location = {
            row: newFullBoard.length -12,
            col: newFullBoard[newFullBoard.length - 12].length - 18
        }

        this.setState({ boardLocation: location, fullBoard: newFullBoard, boardView: newBoard, start: true }, () => this.findBro())
    }

    syncView() {
        let newView = [];
        for (let i = this.state.boardLocation.row; i < this.state.boardLocation.row + 12; i++) {
            newView.push(this.state.fullBoard[i].slice(this.state.boardLocation.col, this.state.boardLocation.col + 18));
        }
        this.setState(() => {
            return { boardView: newView };
        })
    }

    findBro() {
        for (let row = 0; row < this.state.fullBoard.length; row++) {
            for (let col = 0; col < this.state.fullBoard[row].length; col++) {
                if (this.state.fullBoard[row][col] === './images/dudeRight.png' || this.state.fullBoard[row][col] === './images/dudeLeft.png'){
                    let direction = this.state.fullBoard[row][col] === './images/dudeRight.png';
                    let newBrocation = {
                        row: row,
                        col: col
                    };
                    this.setState(() => {
                        return { brocation: newBrocation, broRight: direction };
                    })
                }
                if (this.state.fullBoard[row][col] === './images/door.png'){
                    this.setState(() => {
                        let newDoorLocation = {
                            row: row,
                            col: col
                        };
                        return { doorLocation: newDoorLocation };
                    })
                }
            }
        }
    }

    broDirection(e, boolean) {
        this.setState({broRight: boolean}, () => {
            let newBoard = this.state.fullBoard.slice();
            boolean ? newBoard[this.state.brocation.row][this.state.brocation.col] = './images/dudeRight.png' : 
                newBoard[this.state.brocation.row][this.state.brocation.col] = './images/dudeLeft.png';
            
            this.setState({ fullBoard: newBoard}, () => {
                this.syncView();
            });
        });
    }

/* //////////////////////  MOVE  /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////*/
    move(event) {

        if (this.state.pswdScreen) {
            if (this.state.start) {
                this.setState(() => { return { pswdScreen: false }; });
            }
            return;
        }

        if (this.state.start) {
            if (this.state.start) {
                this.setState(() => { return { start: false }; });
            }
            return;
        }

        let newBoard = this.state.fullBoard.slice();

        if (event.key === 'r') {
            this.mountLevel();
            return;
        }

        if (event.shiftKey === true) {
            this.moveView(event);
            return;
        } else if (event.key === 'ArrowLeft') {
            if (this.state.broRight === true) {
                this.broDirection(null, false)
            }

            //if left is empty or door, and block on head, and higher than 2nd to last row.
            if ((newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/empty.png' ||
                newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/door.png') &&
                newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/block.png') {
                    
                // if left/down space empty, fall down
                if (newBoard[this.state.brocation.row + 1][this.state.brocation.col - 1] === './images/empty.png') {
                    let newBrocation = {
                        col: this.state.brocation.col - 1
                    }
                    
                    for (let i = this.state.brocation.row + 2; i < newBoard.length; i++) {
                        if (newBoard[i][this.state.brocation.col - 1] === './images/block.png' ||
                            newBoard[i][this.state.brocation.col - 1] === './images/brick.png') {
                            newBoard[i - 1][this.state.brocation.col - 1] = './images/dudeLeft.png';
                            newBrocation.row = i - 1;
                            break;
                        }
                    }
                    newBoard[newBrocation.row - 1][newBrocation.col] = './images/block.png';
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png';
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png';

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col - 1 <= this.state.boardLocation.col + 8 && 
                        this.state.boardLocation.col !== 0) {
                        newBoardLocation.col--;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                //moves but doesn't fall
                } else {
                    newBoard[this.state.brocation.row][this.state.brocation.col - 1] = './images/dudeLeft.png'
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col - 1] = './images/block.png'
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png'
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png'

                    let newBrocation = {
                        row: this.state.brocation.row,
                        col: this.state.brocation.col - 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col - 1 <= this.state.boardLocation.col + 8 &&
                        this.state.boardLocation.col !== 0) {
                        newBoardLocation.col--;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                }
              //if left space is empty or a door, and no block is above. 
            } else if (newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/empty.png' ||
                newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/door.png') {
                    // if left/down space empty, fall down
                if (newBoard[this.state.brocation.row + 1][this.state.brocation.col - 1] === './images/empty.png') {
                    let newBrocation = {
                        col: this.state.brocation.col - 1
                    }
                    
                    for (let i = this.state.brocation.row + 2; i < newBoard.length; i++) {
                        if (newBoard[i][this.state.brocation.col - 1] === './images/block.png' ||
                            newBoard[i][this.state.brocation.col - 1] === './images/brick.png') {
                            newBoard[i - 1][this.state.brocation.col - 1] = './images/dudeLeft.png';
                            newBrocation.row = i - 1;
                            break;
                        }
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col - 1 <= this.state.boardLocation.col + 8 &&
                        this.state.boardLocation.col !== 0) {

                        newBoardLocation.col--;
                    }

                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png';
                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                } else {
                    newBoard[this.state.brocation.row][this.state.brocation.col - 1] = './images/dudeLeft.png'
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png'

                    let newBrocation = {
                        row: this.state.brocation.row,
                        col: this.state.brocation.col - 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col - 1 <= this.state.boardLocation.col + 8 &&
                        this.state.boardLocation.col !== 0) {
                        newBoardLocation.col--;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                }
            }
        } else if (event.key === 'ArrowRight') {
            if (this.state.broRight === false) {
                this.broDirection(null, true)
            }

                //if right empty, or door and carrying block, move both right
            if ((newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/empty.png' || 
                newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/door.png') && 
                newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/block.png') {
                
    
                // if left/down space empty, fall down
                if (newBoard[this.state.brocation.row + 1][this.state.brocation.col + 1] === './images/empty.png') {
                    let newBrocation = {
                        col: this.state.brocation.col + 1
                    }

                    for (let i = this.state.brocation.row + 2; i < newBoard.length; i++) {
                        if (newBoard[i][this.state.brocation.col + 1] === './images/brick.png' || 
                            newBoard[i][this.state.brocation.col + 1] === './images/block.png') {
                            newBoard[i - 1][this.state.brocation.col + 1] = './images/dudeRight.png';
                            newBrocation.row = i - 1;
                            break;
                        }
                    }
                    newBoard[newBrocation.row - 1][newBrocation.col] = './images/block.png';
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png';
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png';

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col + 1 >= this.state.boardLocation.col + 9 &&
                        this.state.boardLocation.col + 17 !== this.state.fullBoard[0].length - 1) {
                        newBoardLocation.col++;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                    //moves but doesn't fall
                } else {
                    newBoard[this.state.brocation.row][this.state.brocation.col + 1] = './images/dudeRight.png';
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col + 1] = './images/block.png';
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png';
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png';

                    let newBrocation = {
                        row: this.state.brocation.row,
                        col: this.state.brocation.col + 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col + 1 >= this.state.boardLocation.col + 9 &&
                        this.state.boardLocation.col + 17 !== this.state.fullBoard[0].length - 1) {
                        newBoardLocation.col++;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                }
      
                //if right empty or door, move bro
            } else if (newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/empty.png' ||
                newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/door.png') {
                
                // if row/down space empty, fall down
                if (newBoard[this.state.brocation.row + 1][this.state.brocation.col + 1] === './images/empty.png') {
                    let newBrocation = {
                        col: this.state.brocation.col + 1
                    }

                    for (let i = this.state.brocation.row + 2; i < newBoard.length; i++) {
                        if (newBoard[i][this.state.brocation.col + 1] === './images/brick.png' ||
                            newBoard[i][this.state.brocation.col + 1] === './images/block.png') {
                            newBoard[i - 1][this.state.brocation.col + 1] = './images/dudeRight.png';
                            newBrocation.row = i - 1;
                            break;
                        }
                    }
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png';

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col + 1 >= this.state.boardLocation.col + 9 &&
                        this.state.boardLocation.col + 17 !== this.state.fullBoard[0].length - 1) {
                        newBoardLocation.col++;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                } else {
                    newBoard[this.state.brocation.row][this.state.brocation.col + 1] = './images/dudeRight.png'
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png'
                    let newBrocation = {
                        row: this.state.brocation.row,
                        col: this.state.brocation.col + 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col + 1 >= this.state.boardLocation.col + 9 &&
                        this.state.boardLocation.col + 17 !== this.state.fullBoard[0].length - 1) {
                        newBoardLocation.col++;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                }
            } 
            // console.log('right');
        } else if (event.key === 'ArrowUp') {
            // console.log('up');

            if (this.state.broRight) {
                let rightBlock = newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/brick.png' ||
                    newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/block.png';
                let rightUpEmpty = newBoard[this.state.brocation.row - 1][this.state.brocation.col + 1] === './images/empty.png' || newBoard[this.state.brocation.row - 1][this.state.brocation.col + 1] === './images/door.png';
                let holdingBlock = newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/block.png';

                //if block on right, empty space above, and block above, move up
                if (rightBlock && rightUpEmpty && holdingBlock) { 
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col + 1] = './images/dudeRight.png';
                    newBoard[this.state.brocation.row - 2][this.state.brocation.col + 1] = './images/block.png';
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png'
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png'
                    let newBrocation = {
                        row: this.state.brocation.row - 1,
                        col: this.state.brocation.col + 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col + 1 >= this.state.boardLocation.col + 9 &&
                        this.state.boardLocation.col + 17 !== this.state.fullBoard[0].length - 1) {
                        newBoardLocation.col++;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                //if block on right and empty space or door above, move up
                } else if (rightBlock && rightUpEmpty) {
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col + 1] = './images/dudeRight.png';
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png'
                    let newBrocation = {
                        row: this.state.brocation.row - 1,
                        col: this.state.brocation.col + 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col + 1 >= this.state.boardLocation.col + 9 &&
                        this.state.boardLocation.col + 17 !== this.state.fullBoard[0].length - 1) {
                        newBoardLocation.col++;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                }
            } else if (!this.state.broRight) {
                let leftBlock = newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/brick.png' ||
                    newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/block.png';
                let leftUpEmpty = newBoard[this.state.brocation.row - 1][this.state.brocation.col - 1] === './images/empty.png' || newBoard[this.state.brocation.row - 1][this.state.brocation.col - 1] === './images/door.png';
                let holdingBlock = newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/block.png';

                //if block on left, empty space above, and block above, move up
                if (leftBlock && leftUpEmpty && holdingBlock) {
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col - 1] = './images/dudeLeft.png';
                    newBoard[this.state.brocation.row - 2][this.state.brocation.col - 1] = './images/block.png';
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png'
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png'
                    let newBrocation = {
                        row: this.state.brocation.row - 1,
                        col: this.state.brocation.col - 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col - 1 <= this.state.boardLocation.col + 8 &&
                        this.state.boardLocation.col !== 0) {
                        newBoardLocation.col--;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                    //if block on left and empty space above, move up
                } else if (leftBlock && leftUpEmpty) {
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col - 1] = './images/dudeLeft.png';
                    newBoard[this.state.brocation.row][this.state.brocation.col] = './images/empty.png'
                    let newBrocation = {
                        row: this.state.brocation.row - 1,
                        col: this.state.brocation.col - 1
                    }

                    let newBoardLocation = {
                        row: this.state.boardLocation.row,
                        col: this.state.boardLocation.col
                    }
                    if (this.state.brocation.col - 1 <= this.state.boardLocation.col + 8 &&
                        this.state.boardLocation.col !== 0) {
                        newBoardLocation.col--;
                    }

                    this.setState({ fullBoard: newBoard, brocation: newBrocation, boardLocation: newBoardLocation }, () => {
                        this.checkWin();
                        this.syncView();
                    });
                }
            }
        } else if (event.key === 'ArrowDown') {
            // console.log('down');
            if (this.state.broRight) {
                //if block on right and nothing on top, pick up
                if (newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/block.png' &&
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/empty.png') {
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/block.png'
                    newBoard[this.state.brocation.row][this.state.brocation.col + 1] = './images/empty.png'
                    this.setState({ fullBoard: newBoard }, () => this.syncView());
                    //if block on top, and nothing on right, put down
                } else if (newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/block.png') {
                    //if brick, block, or door in the way, dont put down
                    if (newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/brick.png' ||
                    newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/block.png' ||
                    newBoard[this.state.brocation.row][this.state.brocation.col + 1] === './images/door.png') {
                        //place on ledge if space is empty
                        if (newBoard[this.state.brocation.row - 1][this.state.brocation.col + 1] === './images/empty.png') {
                            newBoard[this.state.brocation.row - 1][this.state.brocation.col + 1] = './images/block.png';
                            newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png';
                            this.setState({ fullBoard: newBoard }, () => this.syncView());
                        }
                        return;
                    }
                    let blockLocation = {
                        col: this.state.brocation.col + 1
                    }

                    for (let i = this.state.brocation.row; i < newBoard.length; i++) {
                        if (newBoard[i][this.state.brocation.col + 1] !== './images/empty.png') {
                            blockLocation.row = i - 1;
                            break;
                        }
                    }
                    newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png';

                    newBoard[blockLocation.row][blockLocation.col] = './images/block.png'

                    this.setState({ fullBoard: newBoard }, () => this.syncView());
                }
                //if block on left and nothing on top, pick up
            } else if (newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/block.png' &&
                newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/empty.png') {
                newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/block.png'
                newBoard[this.state.brocation.row][this.state.brocation.col - 1] = './images/empty.png'
                this.setState({ fullBoard: newBoard }, () => this.syncView());
                //if block on top, and nothing on left, put down
            } else if (newBoard[this.state.brocation.row - 1][this.state.brocation.col] === './images/block.png') {
                
                if (newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/brick.png' ||
                    newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/block.png' ||
                    newBoard[this.state.brocation.row][this.state.brocation.col - 1] === './images/door.png') {
                    //place on ledge if space is empty
                    if (newBoard[this.state.brocation.row - 1][this.state.brocation.col - 1] === './images/empty.png') {
                        newBoard[this.state.brocation.row - 1][this.state.brocation.col - 1] = './images/block.png';
                        newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png';
                        this.setState({ fullBoard: newBoard }, () => this.syncView());
                    }
                    return;
                }
                let blockLocation = {
                    col: this.state.brocation.col - 1
                }

                for (let i = this.state.brocation.row; i < newBoard.length; i++) {
                    if (newBoard[i][this.state.brocation.col - 1] !== './images/empty.png') {
                        blockLocation.row = i - 1;
                        break;
                    }
                }
                newBoard[this.state.brocation.row - 1][this.state.brocation.col] = './images/empty.png';

                newBoard[blockLocation.row][blockLocation.col] = './images/block.png'

                this.setState({ fullBoard: newBoard }, () => this.syncView());
            }
        } else {
            return;
        }
    }

/* ///////////////////////  VIEW   ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////*/

    moveView(event) {
        event.preventDefault();
        if (this.state.shiftDown === false) {
            let location = {
                row: this.state.boardLocation.row,
                col: this.state.boardLocation.col
            }

            this.setState(() => {
                return { viewLocation: location };
            })
        }

        if (event.key === 'ArrowLeft') {
            if (this.state.viewLocation.col === 0) {
                return;
            }
            let location = {
                row: this.state.viewLocation.row,
                col: this.state.viewLocation.col - 1
            }
            
            let newView = [];

            for (let i = this.state.viewLocation.row; i < this.state.viewLocation.row + 12; i++) {
                newView.push(this.state.fullBoard[i].slice(this.state.viewLocation.col - 1, this.state.viewLocation.col + 17));
            }

            this.setState(() => {
                return { boardView: newView, viewLocation: location, shiftDown: true};
            })
            // console.log('view left');
        } else if (event.key === 'ArrowRight') {
            if (this.state.viewLocation.col + 17 === this.state.fullBoard[0].length - 1) {
                return;
            }
            let location = {
                row: this.state.viewLocation.row,
                col: this.state.viewLocation.col + 1
            }

            let newView = [];

            for (let i = this.state.viewLocation.row; i < this.state.viewLocation.row + 12; i++) {
                newView.push(this.state.fullBoard[i].slice(this.state.viewLocation.col + 1, this.state.viewLocation.col + 19));
            }

            this.setState(() => {
                return { boardView: newView, viewLocation: location, shiftDown: true };
            })
            // console.log('view right');
        } else if (event.key === 'ArrowUp') {
            if (this.state.viewLocation.row === 0) {
                return;
            }
            let location = {
                row: this.state.viewLocation.row - 1,
                col: this.state.viewLocation.col
            }

            let newView = [];

            for (let i = this.state.viewLocation.row - 1; i < this.state.viewLocation.row + 11; i++) {
                newView.push(this.state.fullBoard[i].slice(this.state.viewLocation.col, this.state.viewLocation.col + 18));
            }

            this.setState(() => {
                return { boardView: newView, viewLocation: location, shiftDown: true };
            })
            // console.log('view up');
        } else if (event.key === 'ArrowDown') {
            if (this.state.viewLocation.row + 11 === this.state.fullBoard.length - 1) {
                return;
            }
            let location = {
                row: this.state.viewLocation.row + 1,
                col: this.state.viewLocation.col
            }

            let newView = [];

            for (let i = this.state.viewLocation.row + 1; i < this.state.viewLocation.row + 13; i++) {
                newView.push(this.state.fullBoard[i].slice(this.state.viewLocation.col, this.state.viewLocation.col + 18));
            }

            this.setState(() => {
                return { boardView: newView, viewLocation: location, shiftDown: true };
            })
            // console.log('view down');
        } else {
            return;
        }
    }

    checkWin() {
        if (this.state.brocation.row === this.state.doorLocation.row && 
            this.state.brocation.col === this.state.doorLocation.col) {
            console.log('WINNER');
            let newLevelIndex = this.state.level;
            newLevelIndex++;
            this.setState({level: newLevelIndex}, () => {
                this.mountLevel();
            })
        }
    }


    render() {
        return (
            <div>
            <div id="gameBoard">
                {this.state.start ? <Popup currentlvl={this.state.level + 1} level={levels[levelArray[this.state.level]]} /> : null}
                {this.state.pswdScreen ? <Password /> : null}
                {this.state.boardView.map((row, i) => {
                    return (
                        <Row 
                            turnToBrick={this.turnToBrick.bind(this)}
                            row={row}
                            rowIndex={i}
                            key={i}
                        />
                    )
                })}
            </div>
                <p className="instructTitles">Objective:</p>
                <ul>
                    <li>
                        Move Quadrilateral Bro to the door to complete each level.
                    </li>
                    <li>
                        Keep track of the lvl password to skip ahead after refresh. 
                    </li>
                </ul>
                <p className="instructTitles">Controles:</p>
                <ul>
                    <li>Use <strong>Left/Right</strong> arrow keys to move left or right. These <br></br> 
                        keys will only turn Quadrilateral Bro if he is trapped in a <br></br>
                        space with no open position to the left or right.</li>
                    <li>Use <strong>Down</strong> arrow key to lift or place a block up or down. <br></br>
                        You can stack block objects two blocks high.
                    </li>
                    <li>
                        Use <strong>Up</strong> arrow key to step up one level. 
                    </li>
                    <li>
                        Use <strong>Shift</strong> + <strong>Arrow Keys</strong> look ahead and explore the level.
                    </li>
                    <li>
                        Use <strong>R</strong> key to restart the current level.
                    </li>
                </ul>
            </div>
        )
    }

}

ReactDOM.render(<App />, document.getElementById('root'));