var Ctrl = function(_analyzer,_PaintBoard){
	var _ctr = new dat.GUI();

	this.analyzer = _analyzer;
	this.paintBoard = _PaintBoard;

	this.params = {
		audio_gain: 1000.,
		brush_size:3.0,
		colorA: [40, 248, 199, 1],
		colorB: [1, 77, 128, 1],
		// backgrounds: 1
	};


  var f1 = _ctr.addFolder('Audio');
	f1.add(this.params, 'audio_gain', 0., 1000.).onChange( this.update_params.bind(this) );

	var f2 = _ctr.addFolder('Brush')
	f2.add(this.params, 'brush_size', 0., 10.).onChange( this.update_params.bind(this) );

	var f3 = _ctr.addFolder('Colors');
	f3.addColor(this.params, 'colorA').onChange( this.update_params.bind(this) );
	f3.addColor(this.params, 'colorB').onChange( this.update_params.bind(this) );

	// var f4 = _ctr.addFolder('Backgrounds');
	// f4.add(this.params, 'backgrounds', {
	// 	'White': 1,
	// 	'Black': 2,
	// }).onChange( this.update_params.bind(this) );

    this.update_params();
};

Ctrl.prototype.update_params = function(){
	this.analyzer.set_gain(this.params.audio_gain);

	this.paintBoard.shdr_brush.uniforms.u_size.value = 20.0 - 2.0 * this.params.brush_size + .1;

	this.paintBoard.shdr_master.uniforms.u_c1.value.x = this.params.colorB[0];
	this.paintBoard.shdr_master.uniforms.u_c1.value.y = this.params.colorB[1];
	this.paintBoard.shdr_master.uniforms.u_c1.value.z = this.params.colorB[2];

	this.paintBoard.shdr_master.uniforms.u_c2.value.x = this.params.colorA[0];
	this.paintBoard.shdr_master.uniforms.u_c2.value.y = this.params.colorA[1];
	this.paintBoard.shdr_master.uniforms.u_c2.value.z = this.params.colorA[2];


  //
	// if(this.params.backgrounds == 1){
	// 	this.img = this.paintBoard.img;
	// }else if (this.params.backgrounds == 2) {
	// 		this.img = this.paintBoard.img2;
	// }
	// this.paintBoard.shdr_master.uniforms.background.value = this.img;

};
