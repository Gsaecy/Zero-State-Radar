/**
 * dsh-cyberdeck — 宿主半侧
 * 纯前端皮肤，宿主侧无需任何服务；保留最小 apply 以便 bundle patch 正常挂载。
 */
const name = 'dsh-cyberdeck'
const inject = []

function apply() {}

const plugin = { name, inject, apply }
export { apply, inject, name }
export default plugin
