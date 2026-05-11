module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (message) => {
      const raw = String(message || '')
      const normalized = raw.trim().toLowerCase()

      // Ignora mensajes automatizados/contenido generado por asistentes
      const exactIgnoredMessages = ['initial plan']
      const prefixIgnoredMessages = ['co-authored-by:', '@copilot open a new pull request']

      if (exactIgnoredMessages.includes(normalized)) {
        return true
      }

      if (prefixIgnoredMessages.some((pattern) => normalized.startsWith(pattern))) {
        return true
      }

      // Maneja casos multilínea donde el pie de Copilot aparece en el cuerpo
      if (raw.toLowerCase().includes('\n@copilot open a new pull request')) {
        return true
      }

      return false
    }
  ]
}
