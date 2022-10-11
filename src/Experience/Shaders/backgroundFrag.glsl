varying vec2 vUv;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uGradientRange;
uniform float uGradientOffset;

void main()
{
    vec3 gradient = mix(uColor1, uColor2, vUv.y * uGradientRange - uGradientOffset);

    gl_FragColor = vec4(gradient, 1.0);
}