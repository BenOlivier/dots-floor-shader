varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uScale;
uniform float uAlpha;

mat2 rotationMatrix()
{
	float s = sin(3.1416), c = cos(3.1416);
    return mat2( c, -s, s, c );
}

void main()
{
    float mask = 1.0 - step(vUv.y, 0.5);
    
    vec2 tiledUv = mod(vec2(vUv.x, vUv.y * 2.0), 1.0);

    vec2 rotatedUv = vec2(tiledUv - 1.0) * rotationMatrix();

    vec2 combinedUv = mix(tiledUv, rotatedUv, mask);

    combinedUv /= uScale;

    combinedUv -= uScale * 2.0;
    
    vec4 color = texture2D(uTexture, combinedUv);

    gl_FragColor = vec4(color.rgb, color.a * uAlpha);
}