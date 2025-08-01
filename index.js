import * as CANNON from 'cannon';
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const numObjects = 500;
// threejs variables
let camera,
scene,
renderer,
groundMesh,
meshes = [],
ambientLight,
pointLight,
controls;

// cannonjs variables
let world, groundBody, bodies = [];

// movement variables
let moving = {
  up: false,
  down: false,
  left: false,
  right: false,
  forward: false,
  backward: false,
};

function initTHREE() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 10, 4);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  document.body.appendChild(renderer.domElement);
  
  // create a poinerlocked camera, to use keys and the mouse to move for interactivity
  controls = new PointerLockControls(camera, document.body);
  window.onclick = function() {
    controls.lock();
  };
  scene.add(controls.getObject());
  
  // create the physics bodies to be rendered using three
  const groundGeometry = new THREE.PlaneGeometry(999999, 999999);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c1c2b,
    side: THREE.DoubleSide,
    // wireframe: true
  });
  groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  scene.add(groundMesh);
  

  for (let i = 0; i < numObjects; i++) {
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshStandardMaterial({
      // color: 0xaaaaff,
      color: Math.random()*0xffffff,
      // wireframe: true
    });
    meshes.push(new THREE.Mesh(boxGeometry, boxMaterial));
  }
  
  for (let i = 0; i < numObjects; i++) {
    scene.add(meshes[i]);
  }

  // LIGHTS
  ambientLight = new THREE.AmbientLight(0xededed);
  scene.add(ambientLight);
  
  pointLight = new THREE.PointLight(0xffffff, 4, 100, 0.2);
  pointLight.position.set(20, 20, 0);
  scene.add(pointLight);
}

function initCANNON() {
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0)
  });
  
  groundBody = new CANNON.Body({
    shape: new CANNON.Plane(),
    type: CANNON.Body.STATIC, // equivalent to setting the mass to 0
  });
  

  for (let i = 0; i < numObjects; i++) {
    bodies.push(
      new CANNON.Body({
        mass: 1,
        // make the body half the size of the mesh for proper sizing
        shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
        position: new CANNON.Vec3(0, 20+i*4, 0)
      })
    );
  }
  
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  
  world.addBody(groundBody);
  
  for (let body of bodies) {
    // bury(body) // dark humor :)
    world.addBody(body);
  }
}

function animate() {
  window.requestAnimationFrame(animate);
  if (controls.isLocked) {
    if (moving.left) {
      controls.moveRight(-2);
    }
    if (moving.right) {
      controls.moveRight(2);
    }
    if (moving.forward) {
      controls.moveForward(2);
    }
    if (moving.backward) {
      controls.moveForward(-2);
    }
    if (moving.up) {
      controls.camera.position.y++;
    }
    if (moving.down) {
      controls.camera.position.y--;
    }
    
    // merge the meshes with the physics bodies
    groundMesh.position.copy(groundBody.position);
    groundMesh.quaternion.copy(groundBody.quaternion);
  
    for (let i = 0; i < numObjects; i++) {
      meshes[i].position.copy(bodies[i].position);
      meshes[i].quaternion.copy(bodies[i].quaternion);
    }
  
    world.fixedStep();
  }
  renderer.render(scene, camera);
}

initTHREE();
initCANNON();
animate();


window.onresize = function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
  camera.aspect = window.innerWidth / window.innerHeight;
};

document.addEventListener('keydown', function(event) {
  switch (event.code) {
    case 'KeyW':
      moving.forward = true;
      break;
    case 'KeyS':
      moving.backward = true;
      break;
    case 'KeyA':
      moving.left = true;
      break;
    case 'KeyD':
      moving.right = true;
      break;
    case 'KeyQ':
      moving.up = true;
      break;
    case 'KeyE':
      moving.down = true;
      break;
    default: break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.code) {
    case 'KeyW':
      moving.forward = false;
      break;
    case 'KeyS':
      moving.backward = false;
      break;
    case 'KeyA':
      moving.left = false;
      break;
    case 'KeyD':
      moving.right = false;
      break;
    case 'KeyQ':
      moving.up = false;
      break;
    case 'KeyE':
      moving.down = false;
      break;
    default: break;
  }
});

controls.addEventListener('lock', function() {
  document.getElementById('info').style.display = 'none';
});
controls.addEventListener('unlock', function() {
  document.getElementById('info').style.display = 'block';
});
