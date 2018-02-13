var final_frag =
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

uniform sampler2D r_tex_trace;
uniform sampler2D background;

varying vec2 v_uv;

vec3 rgb (vec3 c){
	  float r = 1.0 - c.r/255.0;
    float g = 1.0 - c.g/255.0;
    float b = 1.0 - c.b/255.0;
    vec3 color = vec3(r,g,b);
    return color;
}

vec3 colorA = u_c1;
vec3 colorB = u_c2;

void main(){
    vec2 m_uv = v_uv;
		vec4 img = texture2D(r_tex_trace, m_uv);
		img = smoothstep(0.0, 1.0, pow(img, vec4(0.6545)));

		vec3 color = mix(rgb(colorA), rgb(colorB), m_uv.y );

		img.rgb *= color;
		img = 1.0 - img + vec4(vec3(0.05),1.0);

		gl_FragColor = img * texture2D(background, m_uv);
}
`;
