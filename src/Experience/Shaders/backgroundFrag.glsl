varying vec2 vUv;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uGradientRange;
uniform float uGradientOffset;

void main()
{
    vec3 gradient = mix(uColor2, uColor1, (vUv.y - 0.5) * uGradientRange - uGradientOffset);

    gl_FragColor = vec4(gradient, 1.0);
}