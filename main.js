var socket = io.connect("http://76.28.150.193:8888");

window.onload = function() {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update});
  var cells = [];
  var h = 60;
  var w = 60;
  var cellsize = 10;
  var run = 0;
  var deadCell = new Cell();
  var deadRow = [];
  var graphics;
  for (var i = 0; i < w; i++){
    deadRow[i] = deadCell;
  }

  var field = document.getElementById("field");
  var username = document.getElementById("username");
  var savebutton = document.getElementById("save");
  var loadbutton = document.getElementById("load");
  savebutton.onclick = function(){
    run = 0;
    console.log('save');
    console.log('username:'+ username.value);
    console.log('statename:'+field.value);
    socket.emit('save', {studentname:username.value, statename:field.value, data:cells});
  };
  loadbutton.onclick= function() {
    run = 0;
    console.log('load');
    console.log('username:'+ username.value);
    console.log('statename:'+field.value);
    socket.emit('load',{studentname:username.value,statename:field.value});
  }
  socket.on("load", function (data) {
    run = 0;
    console.log('data');
    console.log(data);
    cells = data.data;
    graphics.lineStyle(2, 0xe0e0e0, 1);

    for(var i = 0;  i < h; i++){
      for(var j = 0; j < w; j++){
        graphics.drawRect(j * cellsize, i * cellsize, cellsize, cellsize);
        if(cells[i][j].state){
          graphics.beginFill(0xFF0000, 1);
          graphics.drawRect(j * cellsize, i * cellsize, cellsize, cellsize);
          graphics.endFill();
          graphics.lineStyle(2, 0xe0e0e0, 1);
        }
      }
    }
  });
  function preload () {
    game.load.spritesheet('button', 'play.png', 128, 128);
  }

  function create () {
    game.stage.backgroundColor = 0xffffff;
    button = game.add.button(700, 400, 'button', action, this, 0, 0, 0);
    graphics = game.add.graphics(0, 0);
    graphics.lineStyle(2, 0xe0e0e0, 1);

    for(var i = 0;  i < h; i++){
      cells[i]=[];
      for(var j = 0; j < w; j++){
        cells[i][j] = new Cell();
        graphics.drawRect(j * cellsize, i * cellsize, cellsize, cellsize);
      }
    }
    window.graphics = graphics;

  }

  function update() {
    if(game.input.activePointer.isDown){
      var pos = game.input.activePointer.position;
      if (pos.x < 600 && pos.y < 600){
        var j = Math.floor(pos.x / 10);
        var i = Math.floor(pos.y / 10);
        cells[i][j].state = 1;
        graphics.beginFill(0xFF0000, 1);
        graphics.drawRect(j * cellsize, i * cellsize, cellsize, cellsize);
        graphics.endFill();
      }
    }

    if(run) {
      graphics.clear();
      step();
    }
  }
  function action(){
    run = !run;
    if(run){
      game.stage.backgroundColor = 0xffffff;
    } else{
      game.stage.backgroundColor = 0x0000ff;
    }
  }

  function step(){
    var topRow;
    var bottomRow;
    var ncount = 0
    var n;
    var genCells = [];
    for(var i = 0;  i < h; i++) {
      topRow = cells[i-1] || deadRow;
      bottomRow = cells[i+1] || deadRow;
      genCells[i] = [];

      for(var j = 0; j < w; j++){
        n = topRow[j - 1] || deadCell;
        if(n.state) { ncount++;}
        n = topRow[j];
        if(n.state) { ncount++;}
        n = topRow[j + 1] || deadCell;
        if(n.state) { ncount++;}
        n = cells[i][j - 1] || deadCell;
        if(n.state) { ncount++;}
        n = cells[i][j + 1] || deadCell;
        if(n.state) { ncount++;}
        n = bottomRow[j - 1] || deadCell;
        if(n.state) { ncount++;}
        n = bottomRow[j];
        if(n.state) { ncount++;}
        n = bottomRow[j + 1] || deadCell;
        if(n.state) { ncount++;}

        //change state
        if (ncount < 2 || ncount > 3) {
          genCells[i][j] = 0;
        } else if (ncount == 3) {
          genCells[i][j] = 1;
        } else {
          genCells[i][j] = cells[i][j].state;
        }
        ncount = 0;
        graphics.lineStyle(2, 0xe0e0e0, 1);
        graphics.drawRect(j * cellsize, i * cellsize, cellsize, cellsize);

        if(genCells[i][j]){
          graphics.beginFill(0xFF0000, 1);
          graphics.drawRect(j * cellsize, i * cellsize, cellsize, cellsize);
          graphics.endFill();
        }
      }
    }
    for(var i = 0; i < h; i++){
      for(var j = 0; j < w; j++){
        cells[i][j].state = genCells[i][j];
      }
    }
  }

  socket.on("connect", function () {
      console.log("Socket connected.")
  });
  socket.on("disconnect", function () {
      console.log("Socket disconnected.")
  });
  socket.on("reconnect", function () {
      console.log("Socket reconnected.")
  });
};
