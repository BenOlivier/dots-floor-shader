varying vec2 vUv;

uniform vec3 uDotsColor;
uniform float uGridScale;
uniform float uDotRadius;
uniform float uAreaRadius;
uniform float uAreaPower;

void main()
{
    float fadedCircle = 1.0 - pow(length(vUv - 0.5) * uAreaRadius, uAreaPower);
    vec2 tiledUv = mod(vUv * uGridScale, 1.0);
    float dots = 1.0 - step(uDotRadius, length(tiledUv - 0.5));
    float fadedDots = dots * fadedCircle;

    //TODO: alpha issue
    gl_FragColor = vec4(uDotsColor * fadedDots, clamp(fadedDots, 0.0, 1.0));
}