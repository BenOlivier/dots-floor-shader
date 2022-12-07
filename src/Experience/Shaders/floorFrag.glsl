varying vec2 vUv;
varying vec3 vPositionW;
varying vec3 vNormalW;
// Floor
uniform vec3 uFloorColor;
uniform float uFloorRadius;
uniform float uFloorPower;
uniform float uFresnelPower;
// Dots
uniform vec3 uDotsColor;
uniform float uDotRadius;
uniform float uGridScale;

void main()
{
    // Radial gradient
    float radialGradient = 1.0 - pow(length(vUv - 0.5) * uFloorRadius, uFloorPower);
    
    // Value to offset every other row by 0.5
    float offsetrows = step(mod(vUv.y * (uGridScale * 0.5), 1.0), 0.5) * 0.5;
    // Tiled UV coordinates
    vec2 tiledUv = mod((vUv + vec2(offsetrows, 0.0)) * uGridScale, 1.0);
    // Dots mask
    float dotsMask = 1.0 - step(uDotRadius, length(tiledUv - 0.5));

    // Floor color
    vec3 floorColor = uFloorColor * (1.0 - dotsMask);
    // Dots color
    vec3 dotsColor = uDotsColor * dotsMask;
    // Combined color
    vec3 combinedColor = floorColor + dotsColor;

    // Fresnel value
    float fresnelTerm = (1.0 - -min(dot(vPositionW, normalize(vNormalW)), 0.0));
    fresnelTerm = clamp(1.0 - pow(fresnelTerm, uFresnelPower), 0.0, 1.0);

    gl_FragColor = vec4(combinedColor, radialGradient * fresnelTerm);
}