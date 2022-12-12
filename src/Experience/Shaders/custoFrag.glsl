varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uScale;
uniform float uOffset;
uniform float uAlpha;
uniform bool uDarkMode;

mat2 rotationMatrix()
{
	float s = sin(3.1416), c = cos(3.1416);
    return mat2( c, -s, s, c );
}

void main()
{
    // Split UV horizontally into 2 tiles
    vec2 tiledUv = mod(vec2(vUv.x, vUv.y * 2.0), 1.0);
    // Rotate the UV 180 degrees
    vec2 rotatedUv = vec2(tiledUv - 1.0) * rotationMatrix();
    // Create a mask for just the top UV tile
    float mask = 1.0 - step(vUv.y, 0.5);
    // Mix the bottom tile with the rotated top tile
    vec2 combinedUv = mix(tiledUv, rotatedUv, mask);
    // Apply scale
    combinedUv = (combinedUv - 0.5) / uScale + 0.5;
    // Apply offset
    combinedUv = vec2(combinedUv.x, combinedUv.y + uOffset);
    // Texture color
    vec4 color = texture2D(uTexture, combinedUv);

    // Dark mode bool - DELETE IN PRODUCTION IMPLEMENTATION IF NOT NEEDED
    if(uDarkMode) color = vec4(1.0 - color.rgb, color.a);

    gl_FragColor = vec4(color.rgb, color.a * uAlpha);
}