

			/****************************************************************************
			*****************************************************************************
			********                      GLOBAL VARIABLES                       ********
			*****************************************************************************
			****************************************************************************/

			//main global variables
			var WIDTH = window.innerWidth; // scene width
		    var HEIGHT = window.innerHeight; // scene height

		    var VIEW_ANGLE = 45; // camera attributes
		    var ASPECT = WIDTH/HEIGHT; // camera attributes
		    var NEAR = 0.1; // camera attributes
		    var FAR = 10000; // camera attributes

		    var renderer = new THREE.WebGLRenderer(); // WebGL renderer
		    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE,ASPECT,NEAR,FAR); // Three js camera
		    camera.position.set( 0, 600, 0 );
			var rotate = true;
		    var scene = new THREE.Scene(); // Three js scene

		    //variables for 3d objects
		    var person = new Array();
			var relationship = new Array();
			var sphereLocations = new Array();

			//variables for tweening
			var tweenDuration = 2500;
			var tweenDelay = 0;

			//variables for 3D text
		    var text;
		    var parent;

			/****************************************************************************
			*****************************************************************************
			********                       SETUP FUNCTIONS                       ********
			*****************************************************************************
			****************************************************************************/

		    //initialise the scene, camera and renderer
		    function init() {
			    scene.add(camera); // add camera to scene
			    scene.fog = new THREE.Fog( 0x000000, 1800, 3000 ); //add fog to the scene
			    renderer.setSize(WIDTH,HEIGHT); // start renderer

			    document.body.appendChild(renderer.domElement); // append render to body
			    window.addEventListener( 'resize', onWindowResize, false ); // when the window is resized, run the onWindowresize method

			    //array to store each sphere. Each sphere represents a person
			    for(var i = 0; i<45; i++){
			    	var ang = Math.floor(Math.random()*360);
			    	var rad = Math.floor(Math.random()*9)+4;
					person[i] = new sphere("some person",rad,ang,0,0,0);
			    }

			    setupRelationshipLines();

			    positionSpheres();

			    //on mouse click, run the onDocumentMouseDown method
			    document.addEventListener( 'mousedown', onDocumentMouseDown, false );

			    //run post processing
			    postProcessing();
			}

			//resize the canvas when the window is resized
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function postProcessing() {

				//POST PROCESSING - Create Shader Passes
				renderPass = new THREE.RenderPass( scene, camera );
				copyPass = new THREE.ShaderPass( THREE.CopyShader );
				vignettePass = new THREE.ShaderPass( THREE.VignetteShader );;
				vignettePass.uniforms[ "darkness" ].value = 1.5;

				composer = new THREE.EffectComposer( renderer );
				composer.addPass( renderPass );
				composer.addPass( vignettePass );
				composer.addPass( copyPass );
				
				copyPass.renderToScreen = true; //set last pass in composer chain to renderToScreen

			}

			//scene lighting
			function addlight() {
				var pointLight = new THREE.PointLight(0xFFFFFF); // point light
				
				pointLight.position.x = 10; // light position
				pointLight.position.y = 50;
				pointLight.position.z = 130;

				scene.add(pointLight); // add light to scene

				scene.add( new THREE.AmbientLight( 0xD9C659 ) );

				var dirLight1 = new THREE.DirectionalLight(0xFFFFFF,0.55,500);
				scene.add(dirLight1);

				var dirLight2 = new THREE.DirectionalLight(0xFFFFFF,0.25,500);
				dirLight2.position.set(0, 0, 1).normalize();
				scene.add(dirLight2);
			}

			//grid. ONLY NEEDED FOR DEVELOPMENT
    		function addGrid() {
				plane = new THREE.Mesh( new THREE.PlaneGeometry( 3000, 3000, 20, 20 ), new THREE.MeshLambertMaterial( { ambient: 0x030303, color: 0x333333, shading: THREE.FlatShading, transparent: false, wireframe: false, blending: THREE.AdditiveBlending } ) );
				plane.rotation.x = - Math.PI / 2;
				plane.position.y = -50;
				scene.add( plane );

				for (var i = 0; i < 441; i++){
					var j = Math.floor(Math.random() * 400 - 600);
					plane.geometry.vertices[i].z = j;
				}
			}

			/****************************************************************************
			*****************************************************************************
			********                      CUSTOM FUNCTIONS                       ********
			*****************************************************************************
			****************************************************************************/

		    //function to create a sphere given the shown parameters. some parameters are stored in the object
			function sphere(sId,sRadius,sAngle,sX,sY,sZ) {
				this.sId = sId;
				this.sRadius = sRadius;
				this.sAngle = sAngle;
				this.sX = sX;
				this.sX = sY;
				this.sX = sZ;

				var sphereMaterial = new THREE.MeshLambertMaterial(
					{ 
						ambient: 0xFFFFFF, color: 0xFFFFFF, specular: 0x000000, shininess: 0, shading: THREE.FlatShading, opacity: 1.0, transparent: true
					} 
				);

				var sphereGeometry = new THREE.SphereGeometry(sRadius, 6, 6)

			    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial); // create new mesh - sphere geometry

				this.sphere.position.x = sX;
		    	this.sphere.position.y = sY;
		    	this.sphere.position.z = sZ;

				scene.add(this.sphere);// add sphere to scene
		    }

		    function positionSpheres(){
		    	var personHolder = new Array();
		    	for(var i = 0; i<person.length; i++){
		    		var counter = 0;
		    		for(var j = 0; j<person.length; j++){
		    			if(i!=j){
		    				if (person[i].sRadius < person[j].sRadius){
		    					counter++;
		    				}
		    			}
		    		}
		    		personHolder[counter] = person[i];

		    		fromPosX = person[i].sphere.position.x;
		    		fromPosY = 0;
		    		fromPosZ = person[i].sphere.position.z;

		    		toPosX = positionSphereX(counter,person[i].sAngle);
		    		toPosY = 0;
		    		toPosZ = positionSphereZ(counter,person[i].sAngle);

		    		setupTween(person[i],fromPosX,fromPosY,fromPosZ, toPosX,toPosY,toPosZ);
		    	}


		    }

		    function positionSphereX(counter,sAngle){
		    	hyp = counter*(800/person.length);
		    	return(Math.cos(sAngle)*hyp);
		    }

		    function positionSphereZ(counter,sAngle){
		    	hyp = counter*(800/person.length);
		    	return(Math.sin(sAngle)*hyp);
		    }

		    //function to create a line from one sphere to another. Both spheres are stored in variables 'sphereA' and 'sphereB'.
		    function line(sphereA, sphereB, lineOpacity){

		    	this.sphereA = sphereA;
		    	this.sphereB = sphereB;

	    		var pointA = new THREE.Vector3( sphereA.sphere.position.x, sphereA.sphere.position.y, sphereA.sphere.position.z );
			    var pointB = new THREE.Vector3( sphereB.sphere.position.x, sphereB.sphere.position.y, sphereB.sphere.position.z );

			    var lineGeometry = new THREE.Geometry();

			    lineGeometry.vertices.push( pointA ); 
			    lineGeometry.vertices.push( pointB );
			    lineGeometry.verticesNeedUpdate = true;

			    var lineMaterial = new THREE.LineBasicMaterial( { color: 0xFFFFFF, transparent: true, opacity: lineOpacity, linewidth:1 } );

			    this.line = new THREE.Line( lineGeometry, lineMaterial );
			    this.line.geometry.verticesNeedUpdate = true;

				scene.add( this.line );

		    }

		    //when this method is called, all new variables for the sphere are stored, the old sphere is removed and a new sphere with the new variables is created.
		    function updateSphereRadius(){
		    	for(var i = 0; i<person.length; i++){
		    		var newId = person[i].sId;
					var newRadius = person[i].sRadius;
					var newAngle = person[i].sAngle;
					var newX = person[i].sphere.position.x;
					var newY = person[i].sphere.position.y;
					var newZ = person[i].sphere.position.z;

					//Used to randomly change the radius, incrementing or decrementing by 3. USED FOR DEVLEOPMENT ONLY. 
					var plusOrMinus = Math.floor(Math.random()*2);
					var newRadius;
					if(plusOrMinus == 0){newRadius = (person[i].sRadius) + 1}
					else{newRadius = (person[i].sRadius) - 1}
					if(newRadius < 1){newRadius = 1;}
					//USED FOR DEVLEOPMENT ONLY

					scene.remove(person[i].sphere);
					person[i] = new sphere(newId,newRadius,newAngle,newX,newY,newZ);
			}

				

				for (var i = 0; i < relationship.length; i++){
					scene.remove(relationship[i].line);
				}

				setupRelationshipLines();

				positionSpheres();
		    }

		    function setupRelationshipLines(){
		    	var counter = 0;

		    	for( var a = (person.length-1); a>0; a--){

		    		for(var b = (a-1); b>=0; b--){
		    			var opacity = Math.random();
		    			relationship[counter] = new line(person[a], person[b], opacity);
		    			counter++;

		    		}

		    	}
		    }

			function setupTween(objectToTween,fromPosX,fromPosY,fromPosZ,toPosX,toPosY,toPosZ)
			{ 
				var update	= function(){
					objectToTween.sphere.position.x = current.x;
					objectToTween.sphere.position.y = current.y;
					objectToTween.sphere.position.z = current.z;
				}

				var current	= { x: fromPosX, y: fromPosY, z: fromPosZ };
				var easing	= TWEEN.Easing['Quintic']['EaseInOut'];
				
				var tweenHead	= new TWEEN.Tween(current)
					.to({x: toPosX, y: toPosY, z: toPosZ}, tweenDuration)
					.delay(tweenDelay)
					.easing(easing)
					.onUpdate(update)
					.start();
			}

			//loop to set the two vertices of each relationship line equal to the positions of the two sphere they connect to 
			function updateRelationshipVertices(){
				for(var i = 0; i<relationship.length; i++){

					var sphereAPos = relationship[i].sphereA.sphere.position;
					var sphereBPos = relationship[i].sphereB.sphere.position;
					
					relationship[i].line.geometry.vertices[0].set(sphereAPos.x,sphereAPos.y,sphereAPos.z);
					relationship[i].line.geometry.vertices[1].set(sphereBPos.x,sphereBPos.y,sphereBPos.z);
					relationship[i].line.geometry.verticesNeedUpdate = true;
				}
			}

			//when the mouse is clicked, do this. FOR DEVELOPMENT ONLY.
			function onDocumentMouseDown() {
				TWEEN.removeAll();
				updateSphereRadius();
			}

		    /****************************************************************************
			*****************************************************************************
			********                     ANIMATION FUNCTION                      ********
			*****************************************************************************
			****************************************************************************/

    		function animate(t) {

				/* ANIMATIONS HERE------------------------------------------- */

				var timer = Date.now() * 0.0002;

				if ( rotate ) {

					camera.position.x = Math.cos( timer ) * 1500;
					camera.position.z = Math.sin( timer ) * 1500;

				}
				
				//set the two vertices of each relationship line equal to the positions of the two sphere they connect to 
				updateRelationshipVertices();

				/* ANIMATIONS END------------------------------------------- */

				camera.lookAt( scene.position );
				renderer.render(scene, camera); // render scene
				requestAnimationFrame( animate );
				TWEEN.update();
				composer.render( 0.1); // required for post processing
				
			}

			/****************************************************************************
			*****************************************************************************
			********                       RUN EVERYTHING                        ********
			*****************************************************************************
			****************************************************************************/
			//run all the functions to make it work
			init(); // run intitialise function
			addlight(); // add light to scene
			addGrid(); // add a grid to the scene;
			animate();// run animate loop
	