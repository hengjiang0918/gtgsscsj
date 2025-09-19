//在dist并列的文件夹中创建脚本文件 (用于替换module等关键词，省的每次得手动删除)`toFile.mjs`创建 toFiles.mjs (为啥格式不是js为了执行命令不报兼容的错误)
import fs from 'fs'
console.time('转换耗时')
const distPath = './dist/index.html' //打包路径的index.html
let htmlText = fs.readFileSync(distPath, 'utf8')
let resultText = ''
let htmlArr = htmlText.match(/.*\n/g) || []
htmlArr.forEach((str) => {
    str = str.replace(/\s?nomodule\s?/g, ' ')
    str = str.replace(/\s?crossorigin\s?/g, ' ')
    str = str.replace(/data-src/g, 'src')
    if (!/type="module"/i.test(str)) resultText += str
})
fs.writeFileSync(distPath, resultText, 'utf8')
console.timeEnd('转换耗时')