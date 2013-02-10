(function (){

        //THREE STUFF
        var camera,
        scene,
        renderer,
        geometry,
        lineGeometry,
        sphereGeometry,
        material,
        materialBlue,
        materialOrange,
        lineMaterial,
        sphereMterial,
        personOneCube,
        personTwoCube,
        PersonOneLinkTwo,
        orb,
        rotation,
        mouseX = 0,
        mouseY = 0;
        //



        var bigCircle = '',
        relationshipConnections = {};
        maxConnection = {};

        var socket = io.connect('http://178.79.132.119');

            socket.on('relationshipConnections', function (data) {

                    relationshipConnections = data;

                    //console.log('Relationship Connections Data:   ',  relationshipConnections);

                    for ( var i = 1; i < 7; i++){

                        if ( relationshipConnections.conId === i ) {

                            console.log('Relationship for', i , ' is ', relationshipConnections.relationship);

                            $('#rel'+i).html('Relationship ID ' + i  + "'s connection is " + relationshipConnections.relationship);
                        }
                    }

            });
            socket.on('maxConnection', function (data) {

                    maxConnection = data;

                   // console.log('Max Connection Data:   ',  maxConnection);

                   for ( var i = 0 ; i < 4; i++) {

                        if ( maxConnection.id === i ) {

                            console.log('Max Connection for ', i , ' is ', maxConnection.max);

                            $('#user'+i).html('Max Connection for ID ' + i  + " = " + maxConnection.max);
                        }
                    }

            
            });

            
            
          


        init();
        animate();

    function init() { // ANYTHING in here will not update

        // CAMERA ans SETUP type stuff
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set(0, 0, 700);

        scene = new THREE.Scene();
        //scene.fog = new THREE.Fog( 0x000000, 100, 2000 ); // everything further than pram 1 starts to go black

        // Make shapes and materials
        geometry = new THREE.CubeGeometry( 50, 50, 50 );
        lineGeometry = new THREE.Geometry();
        sphereGeometry = new THREE.SphereGeometry( 10, 40, 40 );

        lineGeometry.vertices.push( new THREE.Vector3( -800, 200, 0 ));
        lineGeometry.vertices.push( new THREE.Vector3( -500, 200, 0 ));

        geometry.verticesNeedUpdate = true;

        materialBlue = new THREE.MeshBasicMaterial( { color: 0x1bdbec, wireframe: true } );
        materialOrange = new THREE.MeshBasicMaterial( { color: 0xfabf27, wireframe: true } );
        lineMaterial = new THREE.LineBasicMaterial( { color: 0xfabf27, linewidth: 2  } );
        sphereMterial = new THREE.MeshPhongMaterial( { color: 0xfabf27, shading: THREE.FlatShading } );

        personOneCube = new THREE.Mesh( geometry, materialBlue );
        personTwoCube = new THREE.Mesh( geometry, materialOrange );
        PersonOneLinkTwo = new THREE.Line( lineGeometry, lineMaterial );
        orb = new THREE.Mesh( sphereGeometry, sphereMterial );


        // ADD all the awesome stuff you made
        scene.add( personOneCube);
        scene.add( personTwoCube);
        // scene.add( PersonOneLinkTwo);
        // scene.add( orb );
       // scene.add( new THREE.AmbientLight( 0x222222 ) );

        // Post processing

        renderer = new THREE.WebGLRenderer( {clearAlpha: 1, antialias: false });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.autoClear = false;



        document.body.appendChild( renderer.domElement );
        document.addEventListener( 'mousemove', onMouseMove, false );



    }

    function animate() { // VAlUES here will change on the fly

        // Animation stuff goes inside here
        requestAnimationFrame( animate );

        personOneCube.rotation.x += 0.01;
        personOneCube.rotation.y += 0.02;

        personOneCube.position.x = 200;
        personOneCube.position.y = 200;
        personOneCube.position.z = 200;

        personTwoCube.rotation.x -= 0.01;
        personTwoCube.rotation.y -= 0.02;
        personTwoCube.position.x = 200;
        personTwoCube.position.y = 200;
        personTwoCube.position.z = 200;

        orb.position.set( 50, 100, 800);

        // Testing some mouse movement effects
       // camera.position.set(  (0.3 * mouseY),  0, 2000 + (0.3 * mouseX) );


      //  lineGeometry.vertices.x = THREE.Vector3( -400, (personOneData.gpsLong), 0 );
      //  PersonOneLinkTwo.set( 100, 100,100);


        

        renderer.render( scene, camera );

    }

    function onMouseMove(event) {

            mouseX = event.clientX;
            mouseY = event.clientY;

            //console.log( mouseX, mouseY);


    }



})();