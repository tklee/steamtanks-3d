# game 1

***

This is testing the combining of impact.js, socket.io, and three.js.

The main/non-core (files to pay attention to) files for this demo are:

* [lib/three.js/main.js](lib/three.js/main.js) - orchestrates all the three.js stuff and bridges the gap between Impact + three.js
* [lib/three.js/jetpackFlame.js](lib/three.js/jetpackFlame.js) - jetpack effects
* [lib/impact-wrapper.js](lib/impact-wrapper.js) - generates and stores the required 3D meshes for all entities
* [models/](models/) - geometry/material json data used for Impact entities & level

