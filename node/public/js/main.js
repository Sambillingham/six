(function (){

        var bigCircle = '',
        personOneGpsLong = '50';
        size = personOneGpsLong;

        var socket = io.connect('http://192.168.0.20');

            socket.on('persononedata', function (data) {

                    personOneGpsLong = data.gpsLong;

                    console.log('Person has a long: ',  personOneGpsLong);

                            setTimeout(function () {

                                socket.emit('senddata' );

                            }, 3000);
                            
            });

        // Three.js is Go - Setup
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(500,500);
        /// dump it in the body
        document.body.appendChild(renderer.domElement);
        //  pretty that shit
        renderer.setClearColorHex(0xEEEEEE, 1.0);
        renderer.clear();
        // CAMERA 
        // new THREE.PerspectiveCamera( FOV, viewAspectRatio, zNear, zFar );
        var camera = new THREE.PerspectiveCamera(45, 200/200, 1, 10000);
        camera.position.z = 300;
        // Bitches Love cubes
        var scene = new THREE.Scene();
        var cube = new THREE.Mesh(new THREE.CubeGeometry(50,50,50),
                       new THREE.MeshBasicMaterial({color: 0x000000}));
        
        scene.add(cube);
        // ADD some magic render camera thingy
        renderer.render(scene, camera);

        function animate(t) {
        console.log('SIZE: ', personOneGpsLong);
        // spin the camera in a circle
        camera.position.x = Math.sin(t/1000)*personOneGpsLong;
        camera.position.y = personOneGpsLong;
        camera.position.z = Math.cos(t/1000)*personOneGpsLong;
        // you need to update lookAt every frame
        camera.lookAt(scene.position);
        // renderer automatically clears unless autoClear = false
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate, renderer.domElement);
      };
      animate(new Date().getTime());

    

    

})();