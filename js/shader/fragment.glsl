uniform float time;
uniform float progress;
uniform sampler2D uMatcap;
uniform sampler2D uScan;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

float PI = 3.141592653589793238;
void main() {

	vec3 normal = normalize(vNormal);
	vec3 viewDir = normalize(vViewPosition);
	vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
	vec3 y = cross(viewDir, x);
	vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;

	vec4 matcapColor = texture2D(uMatcap, uv);

	vec2 scanUv = fract(vWorldPosition.xz);

	if(vNormal.y < 0.) {
		scanUv = fract(vUv * 10.);
	}
	vec4 scanMack = texture2D(uScan, scanUv);
	vec3 origin = vec3(0.);

//wave
	float dist = distance(vWorldPosition, origin);
	float radialMove = fract(dist - time);
	radialMove *= 1. - smoothstep(1., 3., dist);
	radialMove *= 1. - step(time, dist);

	float scanMix = smoothstep(0.3, 0., 1. - radialMove);
	scanMix *= 1. + scanMack.r * 0.7;
	scanMix += smoothstep(0.1, 0., 1. - radialMove)*1.5;

	vec3 scanClolr = mix(vec3(1.), vec3(0.5, 0.5, 1.), scanMix*0.2);

	gl_FragColor = vec4(vUv, 0.0, 1.);

	gl_FragColor = vec4(vNormal, 1.);
	gl_FragColor = vec4(vWorldPosition, 1.);
	gl_FragColor = matcapColor;
	gl_FragColor = vec4(vec3(scanMack.z), 1.);
	gl_FragColor = vec4(vec3(radialMove), 1.);
	gl_FragColor = vec4(vec3(scanMix), 1.);
	gl_FragColor = vec4(vec3(scanClolr), 1.);

	gl_FragColor = matcapColor;

	gl_FragColor.rgb = mix(gl_FragColor.rgb, scanClolr, scanMix * 0.5);
}