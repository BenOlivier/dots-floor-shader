uniform vec3 uBarColor;
uniform vec3 uBackgroundColor;
uniform float uFront;
uniform float uBack;
uniform float uAlpha;
varying vec2 vUv;

void main()
{
    float front = step(vUv.x, uFront);
    float back = step(uBack, vUv.x);
    vec3 bar = front * back * uBarColor;
    vec3 background = (1.0 - (front * back)) * uBackgroundColor;

    gl_FragColor = vec4(bar + background, uAlpha);
}