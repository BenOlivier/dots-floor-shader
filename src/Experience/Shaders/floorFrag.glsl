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
// Podium
uniform vec3 uPodiumColor;
uniform float uPodiumRadius;
uniform float uRingThickness;
uniform float uCentreOpacity;

void main()
{
    // Radial gradient
    float radialGradient = 1.0 - smoothstep(0.0, uFloorRadius, sqrt(dot(vUv - 0.5, vUv - 0.5)));
    // Offset every other row by 0.5
    float offsetrows = step(mod(vUv.y * (uGridScale * 0.5), 1.0), 0.5) * 0.5;
    // Tiled UV coordinates
    vec2 tiledUv = mod((vUv + vec2(offsetrows, 0.0)) * uGridScale, 1.0);
    // Dots mask
    float dotsMask = step(uDotRadius, sqrt(dot(tiledUv - 0.5, tiledUv - 0.5)));
    // Floor color
    vec3 floorColor = mix(uDotsColor, uFloorColor, dotsMask);

    // Outer circle
    float outerCircle = 1.0 - step(uPodiumRadius, sqrt(dot(vUv - 0.5, vUv - 0.5)));
	// Inner circle
	float innerCircle = 1.0 - step(uPodiumRadius - uRingThickness, sqrt(dot(vUv - 0.5, vUv - 0.5)));
    // Podium alpha
    float podiumAlpha = mix(1.0, uCentreOpacity, innerCircle) * outerCircle;
    // Combine floor and podium colors
    vec3 combinedColor = mix(floorColor, uPodiumColor, podiumAlpha);

    // Fresnel value
    float fresnelTerm = (1.0 - -min(dot(vPositionW, normalize(vNormalW)), 0.0));
    fresnelTerm = clamp(1.0 - pow(fresnelTerm, uFresnelPower), 0.0, 1.0);

    gl_FragColor = vec4(combinedColor, radialGradient * fresnelTerm);
}