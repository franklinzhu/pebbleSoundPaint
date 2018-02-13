var PaintBoard = function(_renderer, _analyzer, _mouse, _is_retina, _is_mobile){
	  this.is_init = false;

    this.renderer = _renderer;
    this.audio_analyzer = _analyzer;
    this.mouse = _mouse;

    this.is_retina = _is_retina;
    this.is_mobile = _is_mobile;

    this.w = window.innerWidth;
    this.h = window.innerHeight;

    this.matrix = _renderer.matrix;

    this.frame = 1;

    this.init_buffer();
    this.init_shader();
    this.init_texture();
		this.load_model();
    this.init_scene();
		this.init_post();

    window.addEventListener('resize', this.resize.bind(this));
};

PaintBoard.prototype.update = function(){
    var _shdrs_size = this.shdr_batch.length;
    for(var i = 0; i < _shdrs_size; i++){
        this.shdr_batch[i].uniforms.u_t.value = this.timer;

        this.shdr_batch[i].uniforms.u_audio_high.value = this.audio_analyzer.get_high();
        this.shdr_batch[i].uniforms.u_audio_mid.value = this.audio_analyzer.get_mid();
        this.shdr_batch[i].uniforms.u_audio_bass.value = this.audio_analyzer.get_bass();
        this.shdr_batch[i].uniforms.u_audio_level.value = this.audio_analyzer.get_level();
        this.shdr_batch[i].uniforms.u_audio_history.value = this.audio_analyzer.get_history();

        this.shdr_batch[i].uniforms.u_mouse.value = new THREE.Vector2(-this.mouse.get_norm_x(), -this.mouse.get_norm_y());
				this.shdr_batch[i].uniforms.u_draw.value = this.mouse.draw;
    }

    var _cam = this.renderer.get_camera();
		//console.log(finalCam.position.z);

		this.renderer.renderer.render( this.scene_brush, _cam, this.fbo_brush);
		this.shdr_trace.uniforms.r_tex_brush.value = this.fbo_brush.texture;

		this.renderer.renderer.render( this.scene_trace, _cam, this.fbo_trace[this.frame]);
		this.shdr_trace.uniforms.r_tex_trace.value = this.fbo_trace[this.frame].texture;

		this.renderer.renderer.render( this.scene_trace, _cam, this.fbo_trace[this.frame^1]);
		this.shdr_master.uniforms.r_tex_trace.value = this.fbo_trace[this.frame^1].texture;

		//this.renderer.renderer.render( this.scene_master, this.finalCam);

		this.effectComposer.render();

    this.frame ^= 1;

    if(!this.is_init){
        this.is_init = true;

        console.log("app is initiated");
    }

    this.timer = this.renderer.get_timer();

		this.scene_master.children[0].rotation.y += 0.005;

};

PaintBoard.prototype.load_model = function(){

		var manager = new THREE.LoadingManager();
		manager.onProgress = function ( item, loaded, total ) {
				console.log( item, loaded, total );
		};
		var onProgress = function ( xhr ) {
				if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
				}
		};

		var _obj_callback = function ( _is_wire, object ) {
				object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
								child.material = this.shdr_master;
						}
				}.bind(this) );
				object.scale.set(0.1,0.1,0.1);
				object.rotation.z = Math.PI;
				//object.position.set(9,0,0);
				object.castShadow = true;
				object.receiveShadow = true;

				this.scene_master.add( object );
		}

		var loader = new THREE.OBJLoader( manager );
    loader.load( 'assets/Treehouse_Pebble.obj', _obj_callback.bind(this, false), onProgress, undefined );

}

PaintBoard.prototype.init_post = function(){

		this.renderPass = new THREE.RenderPass( this.scene_master, this.finalCam);

		// Setup SSAO pass
		this.ssaoPass = new THREE.SSAOPass(this.scene_master, this.finalCam);
		this.ssaoPass.renderToScreen = true;
		this.ssaoPass.radius = 5;
	  this.ssaoPass.aoClamp = 1;
		this.ssaoPass.lumInfluence = 0.7;

		this.effectComposer = new THREE.EffectComposer( this.renderer.renderer );
		this.effectComposer.addPass( this.renderPass );
		this.effectComposer.addPass( this.ssaoPass );

}

PaintBoard.prototype.init_scene = function(){
    var _geom = new THREE.PlaneBufferGeometry(1., 1., 1.0, 1.0);

    this.scene_brush = new THREE.Scene();
    this.scene_brush.add(new THREE.Mesh(_geom, this.shdr_brush));

    this.scene_trace = new THREE.Scene();
    this.scene_trace.add(new THREE.Mesh(_geom, this.shdr_trace));

    this.scene_master = new THREE.Scene();
		this.scene_master.background = new THREE.Color( 0xffffff );

		this.finalCam = new THREE.PerspectiveCamera( 45, this.w / this.h, .1, 100 ) ;
		this.finalCam.position.z = 15;

};

PaintBoard.prototype.init_buffer = function(){
    // frame buffers
    var _format = {
		wrapS: THREE.ClampToEdgeWrapping,
		wrapT: THREE.ClampToEdgeWrapping,
		minFilter:THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		type: this.is_mobile ? THREE.HalfFloatTye : THREE.FloatType,
		format: THREE.RGBAFormat,
		stencilBuffer:false,
		depthBuffer:false
	};

		this.fbo_brush = new THREE.WebGLRenderTarget(this.w, this.h, _format);

		this.fbo_trace = [2];
		for(var i = 0; i < 2; i++){
				this.fbo_trace[i] = new THREE.WebGLRenderTarget(this.w, this.h, _format);
		}

};

PaintBoard.prototype.init_texture = function(){
    this.img = new THREE.TextureLoader().load("assets/w.png");
    this.img.wrapS = THREE.ClampToEdgeWrapping;
    this.img.wrapT = THREE.ClampToEdgeWrapping;
    this.img.magFilter = THREE.LinearFilter;
    this.img.minFilter = THREE.LinearFilter;

		this.img2 = new THREE.TextureLoader().load("assets/bjork.png");
		this.img2.wrapS = THREE.ClampToEdgeWrapping;
		this.img2.wrapT = THREE.ClampToEdgeWrapping;
		this.img2.magFilter = THREE.LinearFilter;
		this.img2.minFilter = THREE.LinearFilter;

		this.shdr_master.uniforms.background.value = this.img;
};

PaintBoard.prototype.init_shader = function(){
    function load(_vert, _frag){
        return new THREE.ShaderMaterial(
        {
            uniforms: {
                u_t: {value: 0},
                u_audio_high: {value: 0.},
                u_audio_mid: {value: 0.},
                u_audio_bass: {value: 0.},
                u_audio_level: {value: 0.},
                u_audio_history: {value: 0.},
                u_mouse: {value: new THREE.Vector2( -0.5, -0.5 )},
								u_size: {value: 10.0},
								u_draw: {value: 0.0},
								u_wiggle:{value: 0.025},
								u_c1: {value: new THREE.Vector3( 1.0, 77.0, 128.0 )},
								u_c2: {value: new THREE.Vector3( 240.0, 170.0, 205.0)}

            },
            depthTest: {value: false},
            vertexShader:   _vert,
            fragmentShader: _frag
        });
    };
    this.shdr_brush = load(shared_vert, brush_frag);
    this.shdr_trace = load(shared_vert, trace_frag);
    this.shdr_master = load(shared_vert, final_frag);

    this.shdr_batch = [
        this.shdr_brush,
        this.shdr_trace,
        this.shdr_master
    ];

    // init uniforms
    this.shdr_trace.uniforms.r_tex_brush = {value: null};
    this.shdr_trace.uniforms.r_tex_trace = {value: null};

    this.shdr_master.uniforms.r_tex_trace = {value: null};
		this.shdr_master.uniforms.background = {value: null};

};

PaintBoard.prototype.resize = function(){
    this.w = this.is_retina ? this.renderer.w / 2. : this.renderer.w / 1.;
    this.h = this.is_retina ? this.renderer.h / 2. : this.renderer.h / 1.;

		    var width = window.innerWidth;
				var height = window.innerHeight;
				this.finalCam.aspect = width / height;
				this.finalCam.updateProjectionMatrix();
				this.renderer.renderer.setSize( width, height );
				// Resize renderTargets
				this.ssaoPass.setSize( width, height );
				var pixelRatio = this.renderer.renderer.getPixelRatio();
				var newWidth  = Math.floor( width / pixelRatio ) || 1;
				var newHeight = Math.floor( height / pixelRatio ) || 1;
				this.effectComposer.setSize( newWidth, newHeight );
};
