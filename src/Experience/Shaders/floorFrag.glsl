varying vec2 vUv;

uniform vec3 uFloorColor;
uniform float uAreaRadius;
uniform float uAreaPower;

void main()
{
    // Faded circle area
    float fadedCircle = 1.0 - pow(length(vUv - 0.5) * uAreaRadius, uAreaPower);

    gl_FragColor = vec4(uFloorColor, fadedCircle);
}