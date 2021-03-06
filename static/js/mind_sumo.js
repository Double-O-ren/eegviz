function mindSumo(){
    initScene();
}

function initScene(){
    container = $('#glContainer')
    WIDTH = container.width()
    HEIGHT = container.height()

    // create renderer
    renderer = new THREE.WebGLRenderer({'antialias':true})
    renderer.setSize(WIDTH, HEIGHT)
    container.append(renderer.domElement)

    //renderer	= new THREE.WebGLRenderer();
    //renderer.setSize( window.innerWidth, window.innerHeight );
    //document.body.appendChild( renderer.domElement );
    renderer.setClearColor('black',1)

    onRenderFcts	= [];
    scene	= new THREE.Scene();
    camera	= new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 0.01, 1000 );
    camera.position.z = 10;

    //////////////////////////////////////////////////////////////////////////////////
    //		comment								//
    //////////////////////////////////////////////////////////////////////////////////

    light	= new THREE.HemisphereLight( 0xfffff0, 0x101020, 0.2 )
    light.position.set( 0.75, 1, 0.25 )
    scene.add(light)


    //////////////////////////////////////////////////////////////////////////////////
    //		Camera Controls							//
    //////////////////////////////////////////////////////////////////////////////////
    mouse	= {x : 0, y : 0}
    document.addEventListener('mousemove', function(event){
	mouse.x	= (event.clientX / window.innerWidth ) - 0.5
	mouse.y	= (event.clientY / window.innerHeight) - 0.5
    }, false)
    onRenderFcts.push(function(delta, now){
	camera.position.x += (mouse.x*20 - camera.position.x) * 0.01
	camera.position.y += (mouse.y*20 - camera.position.y) * 0.01
	camera.lookAt( scene.position )
    })

    //////////////////////////////////////////////////////////////////////////////////
    //		add an object and make it move					//
    //////////////////////////////////////////////////////////////////////////////////

    nLasers	= 14
    for(var i = 0; i < nLasers; i++){
	(function(){
	    var laserBeam	= new THREEx.LaserBeam()
	    scene.add(laserBeam.object3d)
	    var laserCooked	= new THREEx.LaserCooked(laserBeam)
	    onRenderFcts.push(function(delta, now){
		laserCooked.update(delta, now)
	    })
	    var object3d		= laserBeam.object3d
	    object3d.position.x	= (i-nLasers/2)/2
	    object3d.position.y	= 4
	    object3d.rotation.z	= -Math.PI/2
	})()
    }

    //////////////////////////////////////////////////////////////////////////////////
    //		out box								//
    //////////////////////////////////////////////////////////////////////////////////
    ;(function(){
	var geometry	= new THREE.CubeGeometry(1, 1, 1);
	var material	= new THREE.MeshPhongMaterial({
	    color	: 0xaa8888,
	    specular: 0xffffff,
	    shininess: 300,
	    side	: THREE.BackSide,
	});
	var object3d	= new THREE.Mesh( geometry, material )
	object3d.scale.set(10,8,10)
	scene.add(object3d)
    })()

    //////////////////////////////////////////////////////////////////////////////////
    //		moving torus							//
    //////////////////////////////////////////////////////////////////////////////////

    ;(function(){
	var geometry	= new THREE.TorusGeometry(0.5-0.15, 0.15, 32, 32);
	var material	= new THREE.MeshPhongMaterial({
	    color	: 0xffffff,
	    specular: 0xffffff,
	    shininess: 200,
	});
	var object3d	= new THREE.Mesh( geometry, material )
	object3d.scale.set(1,1,1).multiplyScalar(5)
	scene.add(object3d)

	onRenderFcts.push(function(delta, now){
	    var angle	= 0.1*Math.PI*2*now
	    angle	= Math.cos(angle)*Math.PI/15 + 3*Math.PI/2
	    var radius	= 30
	    object3d.position.x	= Math.cos(angle)*radius
	    object3d.position.y	= (radius-1)+Math.sin(angle)*radius
	    object3d.position.z	= 0.1	// Couch

	    // workaround: if the laser is exactly between 2 faces, it can go thru
	    // object3d.rotation.x	= 0.05*Math.PI*2*now
	})
    })()

    //////////////////////////////////////////////////////////////////////////////////
    //		render the scene						//
    //////////////////////////////////////////////////////////////////////////////////
    onRenderFcts.push(function(){
	renderer.render( scene, camera );
    })

    //////////////////////////////////////////////////////////////////////////////////
    //		loop runner							//
    //////////////////////////////////////////////////////////////////////////////////
    lastTimeMsec= null
    requestAnimationFrame(function animate(nowMsec){
	// keep looping
	requestAnimationFrame( animate );
	// measure time
	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec
	// call each update function
	onRenderFcts.forEach(function(updateFn){
	    updateFn(deltaMsec/1000, nowMsec/1000)
	})
    })

}
