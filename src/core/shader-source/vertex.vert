attribute vec2 a_position;
attribute vec4 a_color;

varying vec4 v_color;

uniform vec2 u_resolution;
uniform float u_point_size;

void main() {
  vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  gl_PointSize = u_point_size;
  v_color = a_color / vec4(255.0, 255.0, 255.0, 255.0);
}