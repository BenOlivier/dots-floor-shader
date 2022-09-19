varying vec2 vUv;

uniform vec3 uColor1;
uniform vec3 uColor2;

void main()
{
    vec3 gradient = mix(uColor1, uColor2, vUv.y * 1.0 - 0.0);

    gl_FragColor = vec4(gradient, 1.0);
}