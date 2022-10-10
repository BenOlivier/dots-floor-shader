uniform float uAlpha;
uniform sampler2D uTexture;
uniform float uAspectRatio;
uniform float uImageScale;


varying vec2 vUv;

void main()
{
    // vec2 ratioOffset = vec2()
    float scaleOffset = (1.0 - uImageScale) / 2.0;
    vec2 scaledUv = vec2(vUv.x * uImageScale + scaleOffset, vUv.y * uImageScale + scaleOffset);
    vec4 texture = texture2D(uTexture, scaledUv);
    gl_FragColor = vec4(texture.rgb, uAlpha);
}