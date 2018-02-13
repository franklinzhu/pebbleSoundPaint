var brush_frag =
`
uniform float u_t;
uniform float u_audio_high;
uniform float u_audio_mid;
uniform float u_audio_bass;
uniform float u_audio_level;
uniform float u_audio_history;
uniform vec2 u_mouse;
uniform float u_size;
uniform float u_draw;
uniform float u_wiggle;
uniform vec3 u_c1;
uniform vec3 u_c2;

varying vec2 v_uv;

float hash12(vec2 p){
	vec3 p3  = fract(vec3(p.xyx) * 0.1031);
	p3 += dot(p3, p3.yzx + 9.0);
	return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 x){
  vec2 f = fract(x)*fract(x)*(3.0-2.0*fract(x));
	return mix(mix(hash12(floor(x)),
                   hash12(floor(x)+vec2(1,0)),f.x),
               mix(hash12(floor(x)+vec2(0,1)),
                   hash12(floor(x)+vec2(1)),f.x),f.y);
}

vec4 circle(vec2 uv, vec2 pos){
  float s = u_size*0.3 + (1.0 - u_audio_level) * 30.0 ;

  uv += pos+vec2(1.0/s);
  float val = clamp(1.0-length(s*uv-1.0), 0.0, 1.0);
  val = pow(5.0*val, 5.0);
	return vec4(clamp(val, 0.0, 1.0));
}


void main(){
	vec2 m_uv = v_uv;
  gl_FragColor = circle(m_uv, u_mouse)*u_draw;
}
`;
