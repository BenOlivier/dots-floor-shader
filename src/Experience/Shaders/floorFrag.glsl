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
uniform vec3 uRingColor;
uniform vec3 uCentreColor;
uniform float uPodiumRadius;
uniform float uRingThickness;
uniform float uCentreOpacity;

void main()
{
    // Radial gradient
    float radialGradient = 1.0 - pow(length((vUv - 0.5) / uFloorRadius), uFloorPower);

    
    // Offset every other row by 0.5
    float offsetrows = step(mod(vUv.y * (uGridScale * 0.5), 1.0), 0.5) * 0.5;
    // Tiled UV coordinates
    vec2 tiledUv = mod((vUv + vec2(offsetrows, 0.0)) * uGridScale, 1.0);
    // Dots mask
    float dotsMask = 1.0 - step(uDotRadius, length(tiledUv - 0.5));


    // Podium inner radius
    float innerRadius = uPodiumRadius - uRingThickness;
    // Outer circle
    float outerCircle = 1.0 - step(uPodiumRadius, length(vUv - 0.5));
	// Inner circle
	float innerCircle = 1.0 - step(innerRadius, length(vUv - 0.5));
    // Podium ring
    float ring = outerCircle - innerCircle;


    // Floor color
    vec3 floorColor = uFloorColor * (1.0 - dotsMask) * (1.0 - outerCircle);
    // Dots color
    vec3 dotsColor = uDotsColor * dotsMask * (1.0 - outerCircle);


    // Ring color
    vec3 ringColor = vec3(uRingColor) * ring;
    // Dots in podium centre color
    vec3 centreDotsColor = (uDotsColor * dotsMask + uFloorColor * (1.0 - dotsMask)) * innerCircle;
    // Centre color
    vec3 centreColor = vec3(uCentreColor) * innerCircle;
    // Combined podium color
    vec3 podiumColor = ringColor + mix(centreDotsColor, centreColor, uCentreOpacity);


    // Combined color
    vec3 combinedColor = floorColor + dotsColor + podiumColor;


    // Fresnel value
    float fresnelTerm = (1.0 - -min(dot(vPositionW, normalize(vNormalW)), 0.0));
    fresnelTerm = clamp(1.0 - pow(fresnelTerm, uFresnelPower), 0.0, 1.0);

    gl_FragColor = vec4(combinedColor, radialGradient * fresnelTerm);
}