const { execSync } = require('child_process')

module.exports = async function (context) {
  const dir = context.appOutDir
  console.log(`[afterPack] Cleaning resource forks/xattrs in: ${dir}`)
  // Remove extended attributes (xattrs)
  execSync(`xattr -cr "${dir}"`, { stdio: 'inherit' })
  // Remove AppleDouble resource fork files (._*) left by zip extraction
  execSync(`find "${dir}" -name "._*" -delete`, { stdio: 'inherit' })
  console.log('[afterPack] Done cleaning')
}
