const $ = id => document.getElementById(id);

const canvas = $("game");
const ctx = canvas.getContext("2d");

const SAVE_KEY = "SCORVEX_G4_SAVE";


/* =========================================================
   SECTORES
========================================================= */

const sectors = [

  {
    name:"NEON DISTRICT",
    bg:"#071226",
    accent:"#35eaff"
  },

  {
    name:"VOID CANYON",
    bg:"#160d25",
    accent:"#b866ff"
  },

  {
    name:"CRIMSON CORE",
    bg:"#210b17",
    accent:"#ff5377"
  },

  {
    name:"STAR FORTRESS",
    bg:"#091b24",
    accent:"#64ffdc"
  },

  {
    name:"OMEGA NEXUS",
    bg:"#111126",
    accent:"#ffd45a"
  }

];


/* =========================================================
   ARMAS
========================================================= */

const weapons = {

  novaBlade:{
    id:"novaBlade",
    name:"NOVA BLADE",
    icon:"🗡️",
    price:0,
    damage:20,
    speed:270,
    cooldown:.18,
    description:"Arma equilibrada para comenzar."
  },

  thunderEdge:{
    id:"thunderEdge",
    name:"THUNDER EDGE",
    icon:"⚡",
    price:180,
    damage:32,
    speed:310,
    cooldown:.15,
    description:"Ataques rápidos con energía eléctrica."
  },

  infernoBlade:{
    id:"infernoBlade",
    name:"INFERNO BLADE",
    icon:"🔥",
    price:350,
    damage:48,
    speed:250,
    cooldown:.23,
    description:"Gran daño con poder de fuego."
  },

  frostEdge:{
    id:"frostEdge",
    name:"FROST EDGE",
    icon:"❄️",
    price:500,
    damage:40,
    speed:275,
    cooldown:.18,
    description:"Sus golpes ralentizan enemigos."
  },

  voidSword:{
    id:"voidSword",
    name:"VOID SWORD",
    icon:"🌌",
    price:800,
    damage:65,
    speed:300,
    cooldown:.16,
    description:"Arma avanzada de energía oscura."
  }

};


/* =========================================================
   HABILIDADES
========================================================= */

const skills = {

  novaBlast:{
    id:"novaBlast",
    name:"NOVA BLAST",
    icon:"⚡",
    price:0,
    cost:30,
    cooldown:3,
    damage:2.5,
    radius:210,
    description:"Explosión de energía alrededor del jugador."
  },

  meteor:{
    id:"meteor",
    name:"METEOR",
    icon:"☄️",
    price:250,
    cost:40,
    cooldown:5,
    damage:4,
    radius:150,
    description:"Una poderosa lluvia de energía golpea la arena."
  },

  freeze:{
    id:"freeze",
    name:"FREEZE",
    icon:"❄️",
    price:300,
    cost:35,
    cooldown:5,
    damage:1.5,
    radius:260,
    description:"Daño y ralentización de enemigos."
  },

  voidPulse:{
    id:"voidPulse",
    name:"VOID PULSE",
    icon:"🌀",
    price:450,
    cost:45,
    cooldown:6,
    damage:3,
    radius:250,
    description:"Pulso que atrae enemigos y causa daño."
  },

  energyShield:{
    id:"energyShield",
    name:"ENERGY SHIELD",
    icon:"🛡️",
    price:550,
    cost:30,
    cooldown:8,
    damage:0,
    radius:0,
    description:"Protege al jugador durante unos segundos."
  },

  overdrive:{
    id:"overdrive",
    name:"OVERDRIVE",
    icon:"💥",
    price:700,
    cost:50,
    cooldown:10,
    damage:0,
    radius:0,
    description:"Aumenta el daño durante varios segundos."
  }

};


/* =========================================================
   ESTADÍSTICAS
========================================================= */

function baseStats(){

  return {

    level:1,

    score:0,

    coins:150,

    xp:0,

    maxHp:120,

    hp:120,

    maxEnergy:100,

    energy:100,

    damage:20,

    speed:270,

    sector:1,

    wave:1,

    kills:0,

    best:0,

    weapon:"novaBlade",

    skill:"novaBlast",

    ownedWeapons:[
      "novaBlade"
    ],

    ownedSkills:[
      "novaBlast"
    ]

  };

}


let stats = load();

let game = null;

let last = performance.now();

let audioOn = true;

let musicOn = true;

let audioCtx = null;

let musicTimer = null;

let musicStep = 0;


/* =========================================================
   CARGAR DATOS
========================================================= */

function load(){

  try{

    const saved =
      JSON.parse(
        localStorage.getItem(
          SAVE_KEY
        )
      );

    return {

      ...baseStats(),

      ...saved,

      ownedWeapons:
        saved?.ownedWeapons ||
        ["novaBlade"],

      ownedSkills:
        saved?.ownedSkills ||
        ["novaBlast"]

    };

  }catch{

    return baseStats();

  }

}


/* =========================================================
   GUARDAR
========================================================= */

function save(){

  stats.best =
    Math.max(
      stats.best,
      stats.score
    );

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(stats)
  );

  menuStats();

}


/* =========================================================
   ESTADÍSTICAS MENÚ
========================================================= */

function menuStats(){

  if($("bestScore"))
    $("bestScore").textContent =
      stats.best;

  if($("bestZone"))
    $("bestZone").textContent =
      stats.sector;

  if($("weaponCount"))
    $("weaponCount").textContent =
      stats.ownedWeapons.length;

  if($("skillCount"))
    $("skillCount").textContent =
      stats.ownedSkills.length;

}


/* =========================================================
   AUDIO
========================================================= */

function createAudio(){

  if(audioCtx)
    return;

  try{

    audioCtx =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }catch{

    audioCtx = null;

  }

}


/* =========================================================
   SONIDO CORTO
========================================================= */

function sound(
  frequency = 440,
  duration = .06,
  type = "sine"
){

  if(!audioOn)
    return;

  try{

    createAudio();

    if(!audioCtx)
      return;

    if(
      audioCtx.state ===
      "suspended"
    ){

      audioCtx.resume();

    }


    const oscillator =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();


    oscillator.type =
      type;

    oscillator.frequency.value =
      frequency;


    gain.gain.value =
      .035;


    oscillator.connect(gain);

    gain.connect(
      audioCtx.destination
    );


    oscillator.start();


    gain.gain.exponentialRampToValueAtTime(
      .0001,
      audioCtx.currentTime +
      duration
    );


    oscillator.stop(
      audioCtx.currentTime +
      duration
    );

  }catch{}

}


/* =========================================================
   MÚSICA GENERADA
========================================================= */

function musicNote(
  frequency,
  duration = .18
){

  if(
    !musicOn ||
    !audioOn
  )
    return;

  try{

    createAudio();

    if(!audioCtx)
      return;


    const oscillator =
      audioCtx.createOscillator();

    const gain =
      audioCtx.createGain();


    oscillator.type =
      "triangle";

    oscillator.frequency.value =
      frequency;


    gain.gain.value =
      .018;


    oscillator.connect(gain);

    gain.connect(
      audioCtx.destination
    );


    oscillator.start();


    gain.gain.exponentialRampToValueAtTime(
      .0001,
      audioCtx.currentTime +
      duration
    );


    oscillator.stop(
      audioCtx.currentTime +
      duration
    );

  }catch{}

}


/* =========================================================
   INICIAR MÚSICA
========================================================= */

function startMusic(){

  if(musicTimer)
    return;


  const menuNotes =
    [
      220,
      277,
      330,
      277,
      247,
      330,
      370,
      330
    ];


  musicTimer =
    setInterval(
      () => {

        if(
          musicOn &&
          audioOn
        ){

          const note =
            menuNotes[
              musicStep %
              menuNotes.length
            ];


          musicNote(
            note,
            .22
          );


          musicStep++;

        }

      },
      320
    );

}


/* =========================================================
   MODO DE MÚSICA
========================================================= */

function setMusicMode(mode){

  musicStep = 0;

  if(mode === "boss"){

    musicNote(
      110,
      .35
    );

    musicNote(
      138,
      .35
    );

  }else if(mode === "combat"){

    musicNote(
      220,
      .2
    );

  }else{

    musicNote(
      330,
      .2
    );

  }

}


/* =========================================================
   INICIAR PARTIDA
========================================================= */

function start(
  reset = false
){

  if(reset){

    stats =
      baseStats();

  }


  game = {

    p:{

      x:600,

      y:350,

      r:18,

      attack:0,

      skill:0,

      dash:0,

      inv:0,

      shield:0,

      overdrive:0

    },

    keys:{},

    enemies:[],

    particles:[],

    floating:[],

    spawn:0,

    paused:false,

    running:true,

    killsWave:0,

    mission:5,

    boss:null,

    combo:0,

    comboTimer:0,

    bossSpawned:false

  };


  $("menu")
    .classList
    .remove("active");


  $("gameScreen")
    .classList
    .add("active");


  last =
    performance.now();


  createAudio();

  setMusicMode(
    "combat"
  );


  sound(
    180,
    .12,
    "sawtooth"
  );


  updateHUD();


  requestAnimationFrame(
    loop
  );

}


/* =========================================================
   ARMA ACTUAL
========================================================= */

function currentWeapon(){

  return weapons[
    stats.weapon
  ] ||
  weapons.novaBlade;

}


/* =========================================================
   HABILIDAD ACTUAL
========================================================= */

function currentSkill(){

  return skills[
    stats.skill
  ] ||
  skills.novaBlast;

}


/* =========================================================
   CREAR ENEMIGO
========================================================= */

function spawn(
  type = "normal"
){

  const side =
    Math.floor(
      Math.random() * 4
    );


  let x;

  let y;


  if(side < 2){

    x =
      Math.random() *
      1200;

    y =
      side === 0
        ? -20
        : 720;

  }else{

    x =
      side === 2
        ? -20
        : 1220;

    y =
      Math.random() *
      700;

  }


  const level =
    stats.level;


  const boss =
    type === "boss";

  const elite =
    type === "elite";


  const hp =
    boss
      ? 650 +
        level * 120

      : elite
        ? 110 +
          level * 20

        : 40 +
          level * 8;


  const enemy = {

    x,

    y,

    r:
      boss
        ? 48

        : elite
          ? 27

          : 17,

    hp,

    max:hp,

    type,

    speed:
      boss
        ? 50

        : elite
          ? 92

          : 112,

    cd:0,

    hit:0,

    phase:
      Math.random() * 6,

    slow:0

  };


  game.enemies.push(
    enemy
  );


  if(boss){

    game.boss =
      enemy;

    game.bossSpawned =
      true;


    $("bossUI")
      .classList
      .remove("hidden");


    $("bossName")
      .textContent =
      "OVERLORD G" +
      stats.sector;


    setMusicMode(
      "boss"
    );

  }

}


/* =========================================================
   PARTÍCULAS
========================================================= */

function particle(
  x,
  y,
  amount = 8,
  color = "#48eaff"
){

  for(
    let i = 0;
    i < amount;
    i++
  ){

    const angle =
      Math.random() *
      Math.PI *
      2;


    const speed =
      40 +
      Math.random() *
      180;


    game.particles.push({

      x,

      y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      life:
        .35 +
        Math.random() *
        .65,

      color

    });

  }

}


/* =========================================================
   TEXTO FLOTANTE
========================================================= */

function floatingText(
  x,
  y,
  text,
  color = "#fff"
){

  game.floating.push({

    x,

    y,

    text,

    life:1,

    color

  });

}


/* =========================================================
   DAÑO
========================================================= */

function damageEnemy(
  enemy,
  amount
){

  enemy.hp -=
    amount;

  enemy.hit =
    .12;


  particle(
    enemy.x,
    enemy.y,
    4
  );


  floatingText(
    enemy.x,
    enemy.y -
      enemy.r -
      8,

    "-" +
      Math.round(
        amount
      ),

    "#7ff5ff"
  );


  if(
    enemy.hp <= 0
  ){

    killEnemy(
      enemy
    );

  }

}


/* =========================================================
   MATAR ENEMIGO
========================================================= */

function killEnemy(
  enemy
){

  const index =
    game.enemies.indexOf(
      enemy
    );


  if(index < 0)
    return;


  game.enemies.splice(
    index,
    1
  );


  const isBoss =
    enemy.type === "boss";

  const isElite =
    enemy.type === "elite";


  stats.kills++;

  game.killsWave++;


  stats.score +=
    isBoss
      ? 2200

      : isElite
        ? 350

        : 100;


  stats.coins +=
    isBoss
      ? 250

      : isElite
        ? 50

        : 12;


  stats.xp +=
    isBoss
      ? 300

      : isElite
        ? 45

        : 13;


  particle(
    enemy.x,
    enemy.y,
    isBoss
      ? 50
      : isElite
        ? 20
        : 10,

    isBoss
      ? "#ff4f75"
      : "#48eaff"
  );


  sound(
    isBoss
      ? 70
      : isElite
        ? 250
        : 420,

    .08,

    "square"
  );


  if(isBoss){

    stats.sector =
      Math.min(
        5,
        stats.sector + 1
      );


    stats.wave++;


    stats.hp =
      stats.maxHp;


    stats.energy =
      stats.maxEnergy;


    game.killsWave =
      0;


    game.mission +=
      5;


    game.boss =
      null;


    game.bossSpawned =
      false;


    $("bossUI")
      .classList
      .add("hidden");


    floatingText(
      game.p.x,
      game.p.y - 50,
      "JEFE DERROTADO!",
      "#ffd85c"
    );


    setMusicMode(
      "combat"
    );

  }


  levelCheck();

  save();

  updateHUD();

}


/* =========================================================
   SUBIR NIVEL
========================================================= */

function levelCheck(){

  while(
    stats.xp >=
    stats.level * 100
  ){

    stats.xp -=
      stats.level * 100;


    stats.level++;


    stats.maxHp +=
      12;


    stats.maxEnergy +=
      8;


    stats.damage +=
      3;


    stats.hp =
      stats.maxHp;


    stats.energy =
      stats.maxEnergy;


    sound(
      780,
      .16,
      "triangle"
    );


    floatingText(
      game.p.x,
      game.p.y - 30,
      "¡NIVEL +1!",
      "#ffd86a"
    );

  }

}


/* =========================================================
   ATAQUE
========================================================= */

function attack(){

  if(
    !game ||
    game.paused ||
    game.p.attack > 0
  )
    return;


  const weapon =
    currentWeapon();


  game.p.attack =
    weapon.cooldown;


  sound(
    weapon.id ===
      "infernoBlade"
      ? 140
      : 230,

    .045,

    "square"
  );


  const targets =
    game.enemies
      .filter(
        enemy => {

          const distance =
            Math.hypot(

              enemy.x -
                game.p.x,

              enemy.y -
                game.p.y

            );

          return distance <
            110;

        }
      )
      .sort(
        (a,b) =>
          Math.hypot(
            a.x -
              game.p.x,

            a.y -
              game.p.y
          )
          -
          Math.hypot(
            b.x -
              game.p.x,

            b.y -
              game.p.y
          )
      );


  if(!targets[0])
    return;


  let damage =
    weapon.damage;


  if(
    game.p.overdrive > 0
  ){

    damage *=
      2;

  }


  damageEnemy(
    targets[0],
    damage
  );


  /* EFECTOS DE ARMAS */

  if(
    weapon.id ===
    "frostEdge"
  ){

    targets[0].slow =
      2;

    floatingText(
      targets[0].x,
      targets[0].y - 30,
      "FREEZE",
      "#7feaff"
    );

  }


  if(
    weapon.id ===
    "infernoBlade"
  ){

    particle(
      targets[0].x,
      targets[0].y,
      10,
      "#ff7b32"
    );

  }


  if(
    weapon.id ===
    "thunderEdge"
  ){

    particle(
      targets[0].x,
      targets[0].y,
      8,
      "#ffe45c"
    );

  }


  if(
    weapon.id ===
    "voidSword"
  ){

    stats.energy =
      Math.min(
        stats.maxEnergy,
        stats.energy + 3
      );

  }


  game.combo++;

  game.comboTimer =
    1.5;

}


/* =========================================================
   HABILIDAD
========================================================= */

function useSkill(){

  if(
    !game ||
    game.paused ||
    game.p.skill > 0
  )
    return;


  const skill =
    currentSkill();


  if(
    stats.energy <
    skill.cost
  ){

    floatingText(
      game.p.x,
      game.p.y - 30,
      "ENERGÍA INSUFICIENTE",
      "#ff718b"
    );

    sound(
      70,
      .1
    );

    return;

  }


  stats.energy -=
    skill.cost;


  game.p.skill =
    skill.cooldown;


  /* NOVA */

  if(
    skill.id ===
    "novaBlast"
  ){

    skillNova();

  }


  /* METEOR */

  if(
    skill.id ===
    "meteor"
  ){

    skillMeteor();

  }


  /* FREEZE */

  if(
    skill.id ===
    "freeze"
  ){

    skillFreeze();

  }


  /* VOID */

  if(
    skill.id ===
    "voidPulse"
  ){

    skillVoid();

  }


  /* SHIELD */

  if(
    skill.id ===
    "energyShield"
  ){

    game.p.shield =
      5;

    particle(
      game.p.x,
      game.p.y,
      35,
      "#63caff"
    );

    floatingText(
      game.p.x,
      game.p.y - 35,
      "ESCUDO ACTIVO",
      "#72d7ff"
    );

    sound(
      500,
      .15,
      "triangle"
    );

  }


  /* OVERDRIVE */

  if(
    skill.id ===
    "overdrive"
  ){

    game.p.overdrive =
      7;

    particle(
      game.p.x,
      game.p.y,
      40,
      "#ffcf4d"
    );

    floatingText(
      game.p.x,
      game.p.y - 35,
      "OVERDRIVE",
      "#ffd45a"
    );

    sound(
      850,
      .18,
      "sawtooth"
    );

  }

}


/* =========================================================
   NOVA
========================================================= */

function skillNova(){

  particle(
    game.p.x,
    game.p.y,
    50,
    "#a45cff"
  );


  game.enemies
    .slice()
    .forEach(
      enemy => {

        if(
          Math.hypot(
            enemy.x -
              game.p.x,

            enemy.y -
              game.p.y
          )
          <
          210
        ){

          damageEnemy(
            enemy,
            stats.damage *
              2.5
          );

        }

      }
    );


  sound(
    75,
    .2,
    "sawtooth"
  );

}


/* =========================================================
   METEOR
========================================================= */

function skillMeteor(){

  const target =
    game.enemies
      .slice()
      .sort(
        (a,b) =>
          Math.hypot(
            a.x -
              game.p.x,

            a.y -
              game.p.y
          )
          -
          Math.hypot(
            b.x -
              game.p.x,

            b.y -
              game.p.y
          )
      )[0];


  if(!target){

    stats.energy +=
      40;

    return;

  }


  particle(
    target.x,
    target.y,
    55,
    "#ff7a38"
  );


  game.enemies
    .slice()
    .forEach(
      enemy => {

        if(
          Math.hypot(
            enemy.x -
              target.x,

            enemy.y -
              target.y
          )
          <
          150
        ){

          damageEnemy(
            enemy,
            stats.damage *
              4
          );

        }

      }
    );


  sound(
    90,
    .25,
    "sawtooth"
  );

}


/* =========================================================
   FREEZE
========================================================= */

function skillFreeze(){

  particle(
    game.p.x,
    game.p.y,
    55,
    "#6deaff"
  );


  game.enemies
    .forEach(
      enemy => {

        if(
          Math.hypot(
            enemy.x -
              game.p.x,

            enemy.y -
              game.p.y
          )
          <
          260
        ){

          enemy.slow =
            5;

          damageEnemy(
            enemy,
            stats.damage *
              1.5
          );

        }

      }
    );


  sound(
    330,
    .25,
    "triangle"
  );

}


/* =========================================================
   VOID PULSE
========================================================= */

function skillVoid(){

  particle(
    game.p.x,
    game.p.y,
    65,
    "#b45cff"
  );


  game.enemies
    .slice()
    .forEach(
      enemy => {

        const dx =
          game.p.x -
          enemy.x;

        const dy =
          game.p.y -
          enemy.y;

        const distance =
          Math.hypot(
            dx,
            dy
          ) || 1;


        if(distance < 280){

          enemy.x +=
            dx /
            distance *
            100;

          enemy.y +=
            dy /
            distance *
            100;


          damageEnemy(
            enemy,
            stats.damage *
              3
          );

        }

      }
    );


  sound(
    100,
    .3,
    "sine"
  );

}


/* =========================================================
   DASH
========================================================= */

function dash(){

  if(
    !game ||
    game.paused ||
    game.p.dash > 0 ||
    stats.energy < 15
  )
    return;


  let dx =
    (
      game.keys.d ||
      game.keys.ArrowRight
    ? 1
    : 0
    )
    -
    (
      game.keys.a ||
      game.keys.ArrowLeft
    ? 1
    : 0
    );


  let dy =
    (
      game.keys.s ||
      game.keys.ArrowDown
    ? 1
    : 0
    )
    -
    (
      game.keys.w ||
      game.keys.ArrowUp
    ? 1
    : 0
    );


  if(!dx && !dy)
    dx = 1;


  const length =
    Math.hypot(
      dx,
      dy
    );


  game.p.x +=
    dx /
    length *
    130;


  game.p.y +=
    dy /
    length *
    130;


  game.p.x =
    Math.max(
      25,
      Math.min(
        1175,
        game.p.x
      )
    );


  game.p.y =
    Math.max(
      25,
      Math.min(
        675,
        game.p.y
      )
    );


  game.p.dash =
    1.2;


  game.p.inv =
    .4;


  stats.energy -=
    15;


  particle(
    game.p.x,
    game.p.y,
    18,
    "#7e70ff"
  );


  sound(
    600,
    .06,
    "triangle"
  );

}


/* =========================================================
   ACTUALIZAR
========================================================= */

function update(dt){

  if(game.paused)
    return;


  const player =
    game.p;


  const keys =
    game.keys;


  let dx =
    (
      keys.d ||
      keys.ArrowRight
    ? 1
    : 0
    )
    -
    (
      keys.a ||
      keys.ArrowLeft
    ? 1
    : 0
    );


  let dy =
    (
      keys.s ||
      keys.ArrowDown
    ? 1
    : 0
    )
    -
    (
      keys.w ||
      keys.ArrowUp
    ? 1
    : 0
    );


  if(dx || dy){

    const length =
      Math.hypot(
        dx,
        dy
      );


    player.x +=
      dx /
      length *
      stats.speed *
      dt;


    player.y +=
      dy /
      length *
      stats.speed *
      dt;

  }


  player.x =
    Math.max(
      25,
      Math.min(
        1175,
        player.x
      )
    );


  player.y =
    Math.max(
      25,
      Math.min(
        675,
        player.y
      )
    );


  player.attack =
    Math.max(
      0,
      player.attack - dt
    );


  player.skill =
    Math.max(
      0,
      player.skill - dt
    );


  player.dash =
    Math.max(
      0,
      player.dash - dt
    );


  player.inv =
    Math.max(
      0,
      player.inv - dt
    );


  player.shield =
    Math.max(
      0,
      player.shield - dt
    );


  player.overdrive =
    Math.max(
      0,
      player.overdrive - dt
    );


  stats.energy =
    Math.min(
      stats.maxEnergy,
      stats.energy +
      9 * dt
    );


  game.comboTimer -=
    dt;


  if(
    game.comboTimer <= 0
  ){

    game.combo = 0;

  }


  /* SPAWN */

  game.spawn -=
    dt;


  const maxEnemies =
    6 +
    Math.min(
      10,
      stats.level
    );


  if(
    game.spawn <= 0 &&
    game.enemies.length <
      maxEnemies &&
    !game.boss
  ){

    const random =
      Math.random();


    spawn(
      random <
        .15 &&
      stats.level >= 2
        ? "elite"
        : "normal"
    );


    game.spawn =
      Math.max(
        .3,
        1 -
        stats.level *
        .03
      );

  }


  /* MISIÓN */

  if(
    game.killsWave >=
      game.mission &&
    !game.boss
  ){

    game.killsWave =
      0;


    game.mission +=
      5;


    stats.coins +=
      60;


    stats.score +=
      300;


    floatingText(
      player.x,
      player.y - 40,
      "MISIÓN COMPLETADA +60 💰",
      "#ffd65a"
    );


    sound(
      900,
      .15,
      "triangle"
    );

  }


  /* JEFE */

  if(
    stats.kills > 0 &&
    stats.kills %
      20 === 0 &&
    !game.boss &&
    !game.bossSpawned
  ){

    spawn("boss");

  }


  /* ENEMIGOS */

  for(
    const enemy
    of game.enemies
  ){

    enemy.phase +=
      dt;


    enemy.cd =
      Math.max(
        0,
        enemy.cd - dt
      );


    enemy.hit =
      Math.max(
        0,
        enemy.hit - dt
      );


    enemy.slow =
      Math.max(
        0,
        enemy.slow - dt
      );


    const ax =
      player.x -
      enemy.x;


    const ay =
      player.y -
      enemy.y;


    const distance =
      Math.hypot(
        ax,
        ay
      ) || 1;


    let speed =
      enemy.speed;


    if(
      enemy.slow > 0
    ){

      speed *=
        .35;

    }


    if(
      enemy.type ===
      "boss"
    ){

      speed *=
        1 +
        Math.sin(
          enemy.phase
        ) *
        .08;

    }


    enemy.x +=
      ax /
      distance *
      speed *
      dt;


    enemy.y +=
      ay /
      distance *
      speed *
      dt;


    /* CONTACTO */

    if(
      distance <
        enemy.r +
        player.r +
        5 &&
      enemy.cd <= 0 &&
      player.inv <= 0
    ){

      if(
        player.shield <= 0
      ){

        stats.hp -=
          enemy.type === "boss"
            ? 16
            : enemy.type === "elite"
              ? 9
              : 6;

      }


      enemy.cd =
        enemy.type === "boss"
          ? 1.1
          : .7;


      player.inv =
        .4;


      sound(
        100,
        .05,
        "sawtooth"
      );


      if(
        stats.hp <= 0
      ){

        respawn();

      }

    }

  }


  /* PARTÍCULAS */

  for(
    const item
    of game.particles
  ){

    item.x +=
      item.vx *
      dt;


    item.y +=
      item.vy *
      dt;


    item.vx *=
      .95;


    item.vy *=
      .95;


    item.life -=
      dt;

  }


  game.particles =
    game.particles.filter(
      item =>
        item.life > 0
    );


  /* TEXTOS */

  for(
    const item
    of game.floating
  ){

    item.y -=
      25 *
      dt;


    item.life -=
      dt;

  }


  game.floating =
    game.floating.filter(
      item =>
        item.life > 0
    );


  updateHUD();

}


/* =========================================================
   RESPAWN
========================================================= */

function respawn(){

  stats.hp =
    stats.maxHp;


  stats.energy =
    stats.maxEnergy;


  stats.score =
    Math.max(
      0,
      stats.score - 250
    );


  stats.coins =
    Math.max(
      0,
      stats.coins - 30
    );


  game.enemies =
    [];


  game.boss =
    null;


  game.bossSpawned =
    false;


  $("bossUI")
    .classList
    .add("hidden");


  floatingText(
    game.p.x,
    game.p.y,
    "REINICIANDO...",
    "#ff6688"
  );


  sound(
    90,
    .15,
    "sawtooth"
  );


  save();

}


/* =========================================================
   DIBUJAR
========================================================= */

function draw(){

  const sector =
    sectors[
      stats.sector - 1
    ];


  /* FONDO */

  ctx.fillStyle =
    sector.bg;


  ctx.fillRect(
    0,
    0,
    1200,
    700
  );


  /* LUZ */

  const gradient =
    ctx.createRadialGradient(
      600,
      350,
      20,
      600,
      350,
      600
    );


  gradient.addColorStop(
    0,
    sector.accent +
      "22"
  );


  gradient.addColorStop(
    1,
    "transparent"
  );


  ctx.fillStyle =
    gradient;


  ctx.fillRect(
    0,
    0,
    1200,
    700
  );


  /* GRID */

  ctx.globalAlpha =
    .32;


  ctx.strokeStyle =
    sector.accent;


  for(
    let x = -700;
    x < 1300;
    x += 50
  ){

    ctx.beginPath();

    ctx.moveTo(
      x,
      0
    );

    ctx.lineTo(
      x + 700,
      700
    );

    ctx.stroke();

  }


  for(
    let y = 0;
    y < 700;
    y += 50
  ){

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      1200,
      y
    );

    ctx.stroke();

  }


  ctx.globalAlpha =
    1;


  /* ENEMIGOS */

  for(
    const enemy
    of game.enemies
  ){

    drawEnemy(
      enemy,
      sector.accent
    );

  }


  /* JUGADOR */

  const player =
    game.p;


  ctx.save();


  ctx.translate(
    player.x,
    player.y
  );


  let angle =
    Math.atan2(

      (
        game.keys.s ||
        game.keys.ArrowDown
      ? 1
      : 0
      )
      -
      (
        game.keys.w ||
        game.keys.ArrowUp
      ? 1
      : 0
      ),

      (
        game.keys.d ||
        game.keys.ArrowRight
      ? 1
      : 0
      )
      -
      (
        game.keys.a ||
        game.keys.ArrowLeft
      ? 1
      : 0
      )

    );


  if(!isFinite(angle))
    angle = 0;


  ctx.rotate(
    angle +
    Math.PI / 2
  );


  /* ESCUDO */

  if(
    player.shield > 0
  ){

    ctx.save();

    ctx.rotate(
      -angle -
      Math.PI / 2
    );

    ctx.strokeStyle =
      "#62d8ff";

    ctx.lineWidth = 4;

    ctx.shadowBlur =
      25;

    ctx.shadowColor =
      "#42dfff";

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      35,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();

  }


  ctx.shadowBlur =
    25;


  ctx.shadowColor =
    "#39eaff";


  ctx.fillStyle =
    player.inv > 0
      ? "#ffffff"
      : "#40e8ff";


  ctx.beginPath();

  ctx.moveTo(
    0,
    -28
  );


  ctx.lineTo(
    19,
    18
  );


  ctx.lineTo(
    0,
    10
  );


  ctx.lineTo(
    -19,
    18
  );


  ctx.closePath();

  ctx.fill();


  ctx.fillStyle =
    "#101832";


  ctx.beginPath();

  ctx.arc(
    0,
    0,
    7,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.restore();


  /* OVERDRIVE */

  if(
    player.overdrive > 0
  ){

    ctx.strokeStyle =
      "#ffd45a";

    ctx.lineWidth =
      3;

    ctx.shadowBlur =
      25;

    ctx.shadowColor =
      "#ffd45a";

    ctx.beginPath();

    ctx.arc(
      player.x,
      player.y,
      43,
      0,
      Math.PI * 2
    );

    ctx.stroke();

  }


  /* PARTÍCULAS */

  for(
    const item
    of game.particles
  ){

    ctx.globalAlpha =
      Math.max(
        0,
        item.life
      );


    ctx.fillStyle =
      item.color;


    ctx.beginPath();


    ctx.arc(
      item.x,
      item.y,
      2.5 +
        3 *
        item.life,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }


  ctx.globalAlpha =
    1;


  /* TEXTO */

  for(
    const item
    of game.floating
  ){

    ctx.globalAlpha =
      Math.max(
        0,
        item.life
      );


    ctx.fillStyle =
      item.color;


    ctx.font =
      "bold 13px Arial";


    ctx.textAlign =
      "center";


    ctx.fillText(
      item.text,
      item.x,
      item.y
    );

  }


  ctx.globalAlpha =
    1;


  /* PAUSA */

  if(game.paused){

    ctx.fillStyle =
      "#01030acc";


    ctx.fillRect(
      0,
      0,
      1200,
      700
    );


    ctx.fillStyle =
      "#ffffff";


    ctx.font =
      "bold 48px Arial";


    ctx.textAlign =
      "center";


    ctx.fillText(
      "PAUSA",
      600,
      330
    );


    ctx.font =
      "12px Arial";


    ctx.fillStyle =
      "#7d8dab";


    ctx.fillText(
      "Presiona P para continuar",
      600,
      360
    );

  }

}


/* =========================================================
   ENEMIGO
========================================================= */

function drawEnemy(
  enemy,
  accent
){

  ctx.save();


  ctx.translate(
    enemy.x,
    enemy.y
  );


  ctx.rotate(
    enemy.phase *
    .5
  );


  ctx.shadowBlur =
    enemy.type === "boss"
      ? 35
      : 18;


  ctx.shadowColor =
    enemy.type === "boss"
      ? "#ff416c"
      : enemy.type === "elite"
        ? "#ad5cff"
        : accent;


  ctx.fillStyle =
    enemy.hit > 0
      ? "#ffffff"
      : enemy.type === "boss"
        ? "#ff3e69"
        : enemy.type === "elite"
          ? "#a65cff"
          : "#ef405e";


  ctx.beginPath();


  for(
    let i = 0;
    i < 6;
    i++
  ){

    const angle =
      i *
      Math.PI /
      3;


    ctx.lineTo(
      Math.cos(angle) *
        enemy.r,

      Math.sin(angle) *
        enemy.r
    );

  }


  ctx.closePath();

  ctx.fill();


  ctx.strokeStyle =
    "#ffd2dc";

  ctx.stroke();


  ctx.restore();


  /* BARRA VIDA */

  ctx.fillStyle =
    "#111";


  ctx.fillRect(
    enemy.x -
      enemy.r,

    enemy.y -
      enemy.r -
      10,

    enemy.r * 2,

    4
  );


  ctx.fillStyle =
    enemy.type === "boss"
      ? "#ff4b68"
      : "#4deaff";


  ctx.fillRect(
    enemy.x -
      enemy.r,

    enemy.y -
      enemy.r -
      10,

    enemy.r *
      2 *
      Math.max(
        0,
        enemy.hp /
          enemy.max
      ),

    4
  );

}


/* =========================================================
   HUD
========================================================= */

function updateHUD(){

  const xpNeed =
    stats.level *
    100;


  const weapon =
    currentWeapon();


  const skill =
    currentSkill();


  $("level").textContent =
    stats.level;


  $("score").textContent =
    stats.score;


  $("coins").textContent =
    stats.coins;


  $("combo").textContent =
    game?.combo ||
    0;


  $("hpText").textContent =
    `${Math.max(
      0,
      Math.round(
        stats.hp
      )
    )} / ${stats.maxHp}`;


  $("energyText").textContent =
    `${Math.round(
      stats.energy
    )} / ${stats.maxEnergy}`;


  $("xpText").textContent =
    `${stats.xp} / ${xpNeed}`;


  $("hpBar").style.width =
    Math.max(
      0,
      stats.hp /
      stats.maxHp *
      100
    ) + "%";


  $("energyBar").style.width =
    stats.energy /
    stats.maxEnergy *
    100 +
    "%";


  $("xpBar").style.width =
    Math.min(
      100,
      stats.xp /
      xpNeed *
      100
    ) + "%";


  $("zoneName").textContent =
    `SECTOR ${
      String(
        stats.sector
      ).padStart(
        2,
        "0"
      )
    }`;


  $("sectorBanner").textContent =
    `SECTOR ${
      String(
        stats.sector
      ).padStart(
        2,
        "0"
      )
    } · ${
      sectors[
        stats.sector - 1
      ].name
    }`;


  $("waveText").textContent =
    `OLEADA ${stats.wave}`;


  $("weaponName").textContent =
    weapon.icon +
    " " +
    weapon.name;


  $("weaponDamage").textContent =
    weapon.damage;


  $("skillName").textContent =
    skill.icon +
    " " +
    skill.name;


  $("skillDescription").textContent =
    skill.description;


  $("skillCd").textContent =
    game?.p.skill > 0
      ? game.p.skill.toFixed(1) +
        "s"
      : "LISTO";


  $("missionText").textContent =
    `Derrota ${
      game?.mission ||
      5
    } enemigos`;


  $("missionProgress").textContent =
    `${
      game?.killsWave ||
      0
    } / ${
      game?.mission ||
      5
    }`;


  $("comboDisplay")
    .querySelector("span")
    .textContent =
    game?.combo ||
    0;


  if(
    stats.level >= 10
  ){

    $("playerRank")
      .textContent =
      "LEYENDA";

  }else if(
    stats.level >= 6
  ){

    $("playerRank")
      .textContent =
      "VETERANO";

  }else if(
    stats.level >= 3
  ){

    $("playerRank")
      .textContent =
      "GUARDIÁN";

  }else{

    $("playerRank")
      .textContent =
      "RECLUTA";

  }


  $("menuSector").textContent =
    String(
      stats.sector
    ).padStart(
      2,
      "0"
    );


  menuStats();


  if(game?.boss){

    $("bossBar").style.width =
      Math.max(
        0,
        game.boss.hp /
        game.boss.max *
        100
      ) + "%";

  }

}


/* =========================================================
   LOOP
========================================================= */

function loop(time){

  if(!game)
    return;


  const dt =
    Math.min(
      .033,
      (time - last) /
      1000
    );


  last =
    time;


  update(dt);

  draw();


  if(game.running){

    requestAnimationFrame(
      loop
    );

  }

}


/* =========================================================
   MODAL
========================================================= */

function modal(
  title,
  html
){

  $("modalTitle")
    .textContent =
    title;


  $("modalBody")
    .innerHTML =
    html;


  $("modal")
    .classList
    .remove("hidden");

}


/* =========================================================
   TIENDA DE ARMAS
========================================================= */

function shop(){

  let html =
    `
    <div class="notice">
      Compra y equipa diferentes armas.
      Cada arma tiene estadísticas y
      efectos diferentes.
    </div>
    `;


  Object.values(
    weapons
  ).forEach(
    weapon => {

      const owned =
        stats.ownedWeapons
          .includes(
            weapon.id
          );


      const equipped =
        stats.weapon ===
        weapon.id;


      html +=
        `
        <div class="shop-item">

          <div class="item-icon">
            ${weapon.icon}
          </div>

          <div class="item-info">

            <b>
              ${weapon.name}
            </b>

            <small>
              ${weapon.description}
            </small>

            <small>
              ⚔️ Daño:
              ${weapon.damage}
              · 🏃 Velocidad:
              ${weapon.speed}
            </small>

            ${
              weapon.price > 0
                ? `
                  <div class="item-price">
                    💰 ${weapon.price}
                  </div>
                `
                : `
                  <div class="item-price">
                    GRATIS
                  </div>
                `
            }

          </div>

          ${
            equipped
              ? `
                <span class="equipped">
                  EQUIPADA
                </span>
              `
              : owned
                ? `
                  <button
                    class="buy-button"
                    data-equip-weapon="${weapon.id}">
                    EQUIPAR
                  </button>
                `
                : `
                  <button
                    class="buy-button"
                    data-buy-weapon="${weapon.id}">
                    COMPRAR
                  </button>
                `
          }

        </div>
        `;

    }
  );


  modal(
    "⚔️ ARMERÍA G4",
    html
  );


  document
    .querySelectorAll(
      "[data-buy-weapon]"
    )
    .forEach(
      button => {

        button.onclick =
          () =>
            buyWeapon(
              button.dataset
                .buyWeapon
            );

      }
    );


  document
    .querySelectorAll(
      "[data-equip-weapon]"
    )
    .forEach(
      button => {

        button.onclick =
          () =>
            equipWeapon(
              button.dataset
                .equipWeapon
            );

      }
    );

}


/* =========================================================
   COMPRAR ARMA
========================================================= */

function buyWeapon(
  weaponId
){

  const weapon =
    weapons[
      weaponId
    ];


  if(!weapon)
    return;


  if(
    stats.ownedWeapons
      .includes(
        weaponId
      )
  ){

    equipWeapon(
      weaponId
    );

    return;

  }


  if(
    stats.coins <
    weapon.price
  ){

    floatingText(
      game?.p.x || 600,
      game?.p.y || 350,
      "MONEDAS INSUFICIENTES",
      "#ff718b"
    );

    sound(
      70,
      .1
    );

    return;

  }


  stats.coins -=
    weapon.price;


  stats.ownedWeapons.push(
    weaponId
  );


  stats.weapon =
    weaponId;


  save();

  updateHUD();


  sound(
    720,
    .12,
    "triangle"
  );


  shop();

}


/* =========================================================
   EQUIPAR ARMA
========================================================= */

function equipWeapon(
  weaponId
){

  if(
    !stats.ownedWeapons
      .includes(
        weaponId
      )
  )
    return;


  stats.weapon =
    weaponId;


  save();

  updateHUD();

  sound(
    600,
    .08,
    "triangle"
  );


  shop();

}


/* =========================================================
   TIENDA DE HABILIDADES
========================================================= */

function skillsShop(){

  let html =
    `
    <div class="notice">
      Desbloquea habilidades especiales
      y equipa una habilidad principal.
      Usa la tecla E durante el combate.
    </div>
    `;


  Object.values(
    skills
  ).forEach(
    skill => {

      const owned =
        stats.ownedSkills
          .includes(
            skill.id
          );


      const equipped =
        stats.skill ===
        skill.id;


      html +=
        `
        <div class="skill-shop-item">

          <div class="item-icon">
            ${skill.icon}
          </div>

          <div class="item-info">

            <b>
              ${skill.name}
            </b>

            <small>
              ${skill.description}
            </small>

            <small>
              ⚡ Energía:
              ${skill.cost}
              · ⏱️ Recarga:
              ${skill.cooldown}s
            </small>

            ${
              skill.price > 0
                ? `
                  <div class="item-price">
                    💰 ${skill.price}
                  </div>
                `
                : `
                  <div class="item-price">
                    GRATIS
                  </div>
                `
            }

          </div>

          ${
            equipped
              ? `
                <span class="equipped">
                  EQUIPADA
                </span>
              `
              : owned
                ? `
                  <button
                    class="buy-button"
                    data-equip-skill="${skill.id}">
                    EQUIPAR
                  </button>
                `
                : `
                  <button
                    class="buy-button"
                    data-buy-skill="${skill.id}">
                    DESBLOQUEAR
                  </button>
                `
          }

        </div>
        `;

    }
  );


  modal(
    "✨ HABILIDADES G4",
    html
  );


  document
    .querySelectorAll(
      "[data-buy-skill]"
    )
    .forEach(
      button => {

        button.onclick =
          () =>
            buySkill(
              button.dataset
                .buySkill
            );

      }
    );


  document
    .querySelectorAll(
      "[data-equip-skill]"
    )
    .forEach(
      button => {

        button.onclick =
          () =>
            equipSkill(
              button.dataset
                .equipSkill
            );

      }
    );

}


/* =========================================================
   COMPRAR HABILIDAD
========================================================= */

function buySkill(
  skillId
){

  const skill =
    skills[
      skillId
    ];


  if(!skill)
    return;


  if(
    stats.ownedSkills
      .includes(
        skillId
      )
  ){

    equipSkill(
      skillId
    );

    return;

  }


  if(
    stats.coins <
    skill.price
  ){

    floatingText(
      game?.p.x || 600,
      game?.p.y || 350,
      "MONEDAS INSUFICIENTES",
      "#ff718b"
    );

    sound(
      70,
      .1
    );

    return;

  }


  stats.coins -=
    skill.price;


  stats.ownedSkills.push(
    skillId
  );


  stats.skill =
    skillId;


  save();

  updateHUD();


  sound(
    850,
    .12,
    "triangle"
  );


  skillsShop();

}


/* =========================================================
   EQUIPAR HABILIDAD
========================================================= */

function equipSkill(
  skillId
){

  if(
    !stats.ownedSkills
      .includes(
        skillId
      )
  )
    return;


  stats.skill =
    skillId;


  save();

  updateHUD();

  sound(
    650,
    .08,
    "triangle"
  );


  skillsShop();

}


/* =========================================================
   INVENTARIO
========================================================= */

function inventory(){

  const weapon =
    currentWeapon();


  const skill =
    currentSkill();


  modal(

    "🎒 INVENTARIO G4",

    `
    <div class="inv-item">

      <div class="item-icon">
        ${weapon.icon}
      </div>

      <div class="item-info">

        <b>
          ${weapon.name}
        </b>

        <small>
          Daño:
          ${weapon.damage}
        </small>

        <small>
          ${weapon.description}
        </small>

      </div>

      <span class="equipped">
        EQUIPADA
      </span>

    </div>


    <div class="inv-item">

      <div class="item-icon">
        ${skill.icon}
      </div>

      <div class="item-info">

        <b>
          ${skill.name}
        </b>

        <small>
          Coste:
          ${skill.cost}
          energía
        </small>

        <small>
          ${skill.description}
        </small>

      </div>

      <span class="equipped">
        ACTIVA
      </span>

    </div>


    <div class="inv-item">

      <div class="item-icon">
        🛡️
      </div>

      <div class="item-info">

        <b>
          ESTADÍSTICAS
        </b>

        <small>
          HP máximo:
          ${stats.maxHp}
        </small>

        <small>
          Energía:
          ${stats.maxEnergy}
        </small>

        <small>
          Velocidad:
          ${stats.speed}
        </small>

      </div>

    </div>


    <div class="notice">

      Armas desbloqueadas:
      ${stats.ownedWeapons.length}
      /
      ${Object.keys(weapons).length}

      <br>

      Habilidades desbloqueadas:
      ${stats.ownedSkills.length}
      /
      ${Object.keys(skills).length}

    </div>
    `

  );

}


/* =========================================================
   CONTROLES
========================================================= */

$("controlsBtn").onclick =
  () => {

    modal(

      "⌨️ CONTROLES G4",

      `
      <div class="grid">

        <div class="control">
          <b>W A S D / FLECHAS</b>
          <br>
          Mover personaje
        </div>

        <div class="control">
          <b>ESPACIO</b>
          <br>
          Ataque con el arma equipada
        </div>

        <div class="control">
          <b>E</b>
          <br>
          Usar habilidad especial
        </div>

        <div class="control">
          <b>SHIFT</b>
          <br>
          Dash rápido
        </div>

        <div class="control">
          <b>P</b>
          <br>
          Pausar partida
        </div>

        <div class="control">
          <b>🛒 ARMAS</b>
          <br>
          Comprar y equipar armas
        </div>

        <div class="control">
          <b>✨ HABILIDADES</b>
          <br>
          Desbloquear poderes especiales
        </div>

        <div class="control">
          <b>🎵 MÚSICA</b>
          <br>
          Activar o desactivar música
        </div>

      </div>
      `

    );

  };


/* =========================================================
   BOTONES
========================================================= */

$("playBtn").onclick =
  () => {

    start(true);

  };


$("continueBtn").onclick =
  () => {

    start(false);

  };


$("shopBtn").onclick =
  () => {

    shop();

  };


$("skillsBtn").onclick =
  () => {

    skillsShop();

  };


$("inventoryBtn").onclick =
  () => {

    inventory();

  };


$("closeModal").onclick =
  () => {

    $("modal")
      .classList
      .add("hidden");

  };


$("modal").onclick =
  event => {

    if(
      event.target ===
      $("modal")
    ){

      $("modal")
        .classList
        .add("hidden");

    }

  };


/* =========================================================
   PAUSA
========================================================= */

$("pauseBtn").onclick =
  () => {

    if(game){

      game.paused =
        !game.paused;

    }

  };


/* =========================================================
   MENÚ
========================================================= */

$("menuBtn").onclick =
  () => {

    if(game)
      save();


    game = null;


    $("gameScreen")
      .classList
      .remove("active");


    $("menu")
      .classList
      .add("active");


    setMusicMode(
      "menu"
    );

  };


/* =========================================================
   MÚSICA
========================================================= */

$("musicBtn").onclick =
  () => {

    musicOn =
      !musicOn;


    $("musicBtn")
      .textContent =
      musicOn
        ? "🎵"
        : "🔇";


    if(musicOn){

      createAudio();

      setMusicMode(
        game
          ? "combat"
          : "menu"
      );

    }

  };


/* =========================================================
   SONIDO
========================================================= */

$("soundBtn").onclick =
  () => {

    audioOn =
      !audioOn;


    $("soundBtn")
      .textContent =
      audioOn
        ? "🔊"
        : "🔕";

  };


/* =========================================================
   REINICIAR
========================================================= */

$("resetBtn").onclick =
  () => {

    if(
      confirm(
        "¿Reiniciar todo el progreso de SCORVEX G4?"
      )
    ){

      localStorage.removeItem(
        SAVE_KEY
      );


      stats =
        baseStats();


      menuStats();

      updateHUD();

    }

  };


/* =========================================================
   TECLADO
========================================================= */

addEventListener(
  "keydown",
  event => {

    if(!game)
      return;


    game.keys[
      event.key
    ] = true;


    if(
      event.code ===
      "Space"
    ){

      event.preventDefault();

      attack();

    }


    if(
      event.key.toLowerCase()
      === "e"
    ){

      useSkill();

    }


    if(
      event.key ===
      "Shift"
    ){

      dash();

    }


    if(
      event.key.toLowerCase()
      === "p"
    ){

      game.paused =
        !game.paused;

    }

  }
);


addEventListener(
  "keyup",
  event => {

    if(game){

      game.keys[
        event.key
      ] = false;

    }

  }
);


/* =========================================================
   GUARDADO
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if(game)
      save();

  }
);


/* =========================================================
   INICIO
========================================================= */

setTimeout(
  () => {

    $("boot")
      .remove();

  },
  900
);


menuStats();

updateHUD();

startMusic();
