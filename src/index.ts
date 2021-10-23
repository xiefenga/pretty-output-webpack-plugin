import { Compiler } from 'webpack'
import { format, Options } from 'prettier'
import { RawSource } from 'webpack-sources'

export default class PrettyOutputPlugin {

  public static PLUGIN_NAME: string = 'PrettyOutputPlugin'

  private options: Options

  public constructor(prettyOptions: Options = {}) {
    this.options = { parser: 'babel', ...prettyOptions }
  }

  public apply(compiler: Compiler): void {
    const { PLUGIN_NAME } = PrettyOutputPlugin
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // 使用 processAssets hook 会影响 sourceMap 文件的生成
      compilation.hooks.afterProcessAssets.tap(PLUGIN_NAME, assets => {
        Object.entries(assets).forEach(([filename, source]) => {
          // 只美化 js 文件
          if (/\.js$/.test(filename)) {
            let content = source.source()
            if (content instanceof Buffer) {
              content = content.toString('utf-8')
            }
            assets[filename] = new RawSource(
              format(
                content.replace(/\/\*[\w\W]*?\*\//g, ''),
                this.options
              )
            )
          }
        })
      })
    })
  }
}