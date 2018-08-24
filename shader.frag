// license https://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US

const vec3 bgColor1 = vec3(0.1, 0.1, 0.12);
const vec3 bgColor2 = vec3(0.12, 0.1, 0.5);
const float cloudDarkColor = 0.4;
const float cloudLightColor = 0.3;
const float cloudCover = 0.01;
const float cloudAlpha = 10.2;
const float skytint = 0.9;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = -0.6;
    float amplitude = 0.75;
    float frequency = -0.040;
    //
    // Loop of octave6
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.120;
        amplitude *= .5;
    }
    return value;
}

void main() {
    float time = iGlobalTime * 0.3;
    vec2 st = gl_FragCoord.xy/iResolution.xy;
    st.x *= iResolution.x /iResolution.y;
    st *= 2.;
    vec3 color = vec3(0.0);
    color += fbm(st*0.3 + time * 0.05);
    color += fbm(st*1.0 + time * 0.1);
    color += fbm(st*2.160 + time * 0.2);
    color += fbm(st*3.0 + time * 0.5);

    // https://thebookofshaders.com/13/
    vec2 r;
    r.x = fbm( st + 0.05*time );
    r.y = fbm( st + 0.15*time);
    
    float w = fbm(st+r + color.xy);
    float w2 = fbm(st + r);
    color *= (w * 0.5 + w2) ;

    // color mixing by @drift: 
    // https://www.shadertoy.com/view/4tdSWr
    vec3 bgColor = mix(bgColor2, bgColor1, st.y);
    vec3 cloudColor = vec3(1.0, 1.0, 5.0) * clamp((cloudDarkColor + cloudLightColor*color), 0.0, 1.0);
    float f = 0.0;
    f  = cloudCover + cloudAlpha*f*r.y;
    
    vec3 result = mix(bgColor1, clamp(skytint * bgColor1 + cloudColor, 0.0, 1.0), clamp(f + color, 0.0, 1.0));
    gl_FragColor = vec4(result,1.0);
}
