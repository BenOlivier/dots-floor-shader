varying vec2 vUv;

uniform vec3 uDotsColor;
uniform float uGridScale;
uniform float uDotRadius;
uniform float uAreaRadius;
uniform float uAreaPower;

void main()
{
    // Value to offset every other row by 0.5
    float offsetrows = step(mod(vUv.y * (uGridScale * 0.5), 1.0), 0.5) * 0.25;
    // Tiled UV coordinates
    vec2 tiledUv = mod((vUv + vec2(offsetrows, 0.0)) * uGridScale, 1.0);
    // Grid of dots
    float dots = 1.0 - step(uDotRadius, length(tiledUv - 0.5));
    // Faded circle area
    float fadedCircle = 1.0 - pow(length(vUv - 0.5) * uAreaRadius, uAreaPower);
    // Alpha value
    float alpha = dots * fadedCircle;

    gl_FragColor = vec4(uDotsColor, alpha);
}