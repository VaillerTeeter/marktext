import path from 'path'

export const applyGlobalStaticPath = (env = process.env.NODE_ENV) => {
  if (env !== 'development' && !global.__static) {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
  }
}

// Set `__static` path to static files in production.
applyGlobalStaticPath()
