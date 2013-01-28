(function (){

        var bigCircle = '',
        personOneData = {};

        var socket = io.connect('http://192.168.0.20');

            socket.on('persononedata', function (data) {

                    personOneData = data;

                    console.log('LOCATION UPDATE is now: ',  personOneData.gpsLong);

                            
                            
            });

var camera, scene, renderer;
    var geometry, material, mesh;

    init();
    animate();

    function init() {

        // Make a Camera - need to make new camera when understood!!!
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set(0, 0, 1000);

        scene = new THREE.Scene();

        // Make shapes and materials
        geometry = new THREE.CubeGeometry( 50, 50, 50 );
        lineGeometry = new THREE.Geometry();

        lineGeometry.vertices.push( new THREE.Vector3( -800, (personOneData.gpsLong), 0 ));
        lineGeometry.vertices.push( new THREE.Vector3( -500, (personOneData.gpsLong), 0 ));

        geometry.verticesNeedUpdate = true;

        materialBlue = new THREE.MeshBasicMaterial( { color: 0x1bdbec, wireframe: true } );
        materialOrange = new THREE.MeshBasicMaterial( { color: 0xfabf27, wireframe: true } );
        lineMaterial = new THREE.LineBasicMaterial( { color: 0xfabf27, linewidth: 2  } );

        personOneCube = new THREE.Mesh( geometry, materialBlue );
        personTwoCube = new THREE.Mesh( geometry, materialOrange );
        PersonOneLinkTwo = new THREE.Line( lineGeometry, lineMaterial );


        // ADD the stuff you just made
        scene.add( personOneCube);
        scene.add( personTwoCube);
        scene.add( PersonOneLinkTwo);

        renderer = new THREE.WebGLRenderer( {clearAlpha: 1, antialias: false });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.autoClear = false;

        document.body.appendChild( renderer.domElement );



    }

    function animate() {

        // Animation stuff goes inside here
        requestAnimationFrame( animate );

        personOneCube.rotation.x += 0.01;
        personOneCube.rotation.y += 0.02;

        personOneCube.position.x =  -500;
        personOneCube.position.y = personOneData.gpsLong;

        personTwoCube.rotation.x -= 0.01;
        personTwoCube.rotation.y -= 0.02;

        personTwoCube.position.x = -800;
        personTwoCube.position.y = 200;

      //  lineGeometry.vertices.x = THREE.Vector3( -400, (personOneData.gpsLong), 0 );
      //  PersonOneLinkTwo.set( 100, 100,100);


        

        renderer.render( scene, camera );

    }



})();