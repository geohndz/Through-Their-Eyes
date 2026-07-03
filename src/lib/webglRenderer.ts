import type { VisionMode } from '../types/vision'

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    v_uv.x = 1.0 - v_uv.x;
    v_uv.y = 1.0 - v_uv.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error('Failed to create shader.')
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'Unknown shader error'
    gl.deleteShader(shader)
    throw new Error(log)
  }

  return shader
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()

  if (!program) {
    throw new Error('Failed to create WebGL program.')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'Unknown link error'
    gl.deleteProgram(program)
    throw new Error(log)
  }

  return program
}

export interface VisionProgram {
  id: VisionMode['id']
  program: WebGLProgram
  textureLocation: WebGLUniformLocation
}

export class WebGLRenderer {
  private gl: WebGLRenderingContext
  private positionBuffer: WebGLBuffer
  private positionLocation: number
  private texture: WebGLTexture
  private programs: Map<VisionMode['id'], VisionProgram> = new Map()
  private activeProgram: VisionProgram | null = null

  constructor(canvas: HTMLCanvasElement, modes: VisionMode[]) {
    const gl = canvas.getContext('webgl', { powerPreference: 'high-performance' })
    if (!gl) {
      throw new Error('WebGL is not supported in this browser.')
    }

    this.gl = gl

    const positionBuffer = gl.createBuffer()
    const texture = gl.createTexture()
    if (!positionBuffer || !texture) {
      throw new Error('Failed to initialize WebGL buffers.')
    }

    this.positionBuffer = positionBuffer
    this.texture = texture

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    )

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    for (const mode of modes) {
      const program = createProgram(gl, VERTEX_SHADER, mode.fragmentShader)
      const textureLocation = gl.getUniformLocation(program, 'u_texture')
      if (!textureLocation) {
        throw new Error(`Missing u_texture uniform for ${mode.id}.`)
      }

      this.programs.set(mode.id, {
        id: mode.id,
        program,
        textureLocation,
      })
    }

    const firstProgram = this.programs.get(modes[0].id)
    if (!firstProgram) {
      throw new Error('Failed to initialize vision programs.')
    }

    this.positionLocation = gl.getAttribLocation(firstProgram.program, 'a_position')
    this.setVisionMode(modes[0].id)
  }

  resize(width: number, height: number): void {
    const { gl } = this
    gl.viewport(0, 0, width, height)
  }

  setVisionMode(id: VisionMode['id']): void {
    const program = this.programs.get(id)
    if (!program) {
      throw new Error(`Unknown vision mode: ${id}`)
    }
    this.activeProgram = program
  }

  render(video: HTMLVideoElement): void {
    const { gl, activeProgram } = this
    if (!activeProgram || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return
    }

    gl.useProgram(activeProgram.program)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
    gl.uniform1i(activeProgram.textureLocation, 0)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.enableVertexAttribArray(this.positionLocation)
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  dispose(): void {
    const { gl } = this
    for (const { program } of this.programs.values()) {
      gl.deleteProgram(program)
    }
    gl.deleteTexture(this.texture)
    gl.deleteBuffer(this.positionBuffer)
    this.programs.clear()
    this.activeProgram = null
  }
}
