varying vec2 vUv;

uniform vec3 uRingColor;
uniform vec3 uCentreColor;
uniform float uPodiumRadius;
uniform float uRingThickness;
uniform float uCentreOpacity;

void main()
{
    // Calculate inner radius
    float innerRadius = uRadius - uRingThickness;
    // Outer circle
    float outerCircle = 1.0 - step(uRadius, length(vUv - 0.5));
	// Inner circle
	float innerCircle = 1.0 - step(innerRadius, length(vUv - 0.5));
    // Subtract inner circle from inner circle
    float ring = outerCircle - innerCircle;
    // Ring color
    vec3 ringColor = vec3(uRingColor) * ring;
    // Centre color
    vec3 centreColor = vec3(uCentreColor) * innerCircle;
    // Mix Color
    vec3 podiumColor = ringColor + centreColor;
    // Centre alpha
    float centreAlpha = innerCircle * uCentreOpacity;
    // Calculate overall alpha
    float podiumAlpha = outerCircle - centreAlpha;

    gl_FragColor = vec4(podiumColor, podiumAlpha);
}